import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const roomId = url.searchParams.get('roomId');
    const where: any = {};

    // Broker sees their own inquiries
    if (session.user.role === 'BROKER') {
      where.brokerId = session.user.id;
    }

    // Landlord sees inquiries for their rooms
    if (session.user.role === 'LANDLORD') {
      where.room = { property: { landlordId: session.user.id } };
    }

    if (roomId) where.roomId = roomId;

    const inquiries = await prisma.roomInquiry.findMany({
      where,
      include: {
        room: { include: { property: { select: { name: true, landlordId: true } } } },
        broker: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BROKER') {
      return NextResponse.json({ error: 'Chỉ Môi giới mới gửi được' }, { status: 403 });
    }

    const { roomId, message } = await req.json();

    // Create inquiry
    const inquiry = await prisma.roomInquiry.create({
      data: {
        roomId,
        brokerId: session.user.id,
        message: message || 'Còn phòng không?',
      },
      include: { room: { include: { property: true } } },
    });

    // Create notification for landlord
    await prisma.notification.create({
      data: {
        userId: inquiry.room.property.landlordId,
        type: 'inquiry',
        title: `MG hỏi phòng ${inquiry.room.roomNumber}`,
        message: `${session.user.name} hỏi: "${inquiry.message}"`,
        link: `/landlord/rooms`,
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// Landlord replies to inquiry
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Chỉ Chủ nhà mới trả lời được' }, { status: 403 });
    }

    const { id, reply } = await req.json();

    const inquiry = await prisma.roomInquiry.update({
      where: { id },
      data: { reply, repliedAt: new Date() },
      include: { room: true, broker: true },
    });

    // Notify broker of reply
    await prisma.notification.create({
      data: {
        userId: inquiry.brokerId,
        type: 'reply',
        title: `Chủ nhà trả lời: ${reply}`,
        message: `Phòng ${inquiry.room.roomNumber}: "${reply}"`,
        link: `/broker/inventory`,
      },
    });

    // If reply is "HẾT", auto-update room availability
    if (reply === 'HẾT') {
      await prisma.room.update({
        where: { id: inquiry.roomId },
        data: { isAvailable: false },
      });
    }

    return NextResponse.json(inquiry);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
