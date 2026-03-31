import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    // Public: view by token (for customers)
    if (token) {
      const link = await prisma.shareLink.findUnique({
        where: { token },
        include: {
          room: {
            include: {
              property: {
                select: {
                  name: true, district: true, streetName: true, city: true,
                  amenities: true, images: true, totalFloors: true,
                  // NO fullAddress, lat, lng, landlord phone
                },
              },
            },
          },
          broker: { select: { name: true } },
        },
      });

      if (!link || !link.isActive) {
        return NextResponse.json({ error: 'Link không tồn tại hoặc đã hết hạn' }, { status: 404 });
      }

      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Link đã hết hạn' }, { status: 410 });
      }

      // Increment view count
      await prisma.shareLink.update({ where: { token }, data: { viewCount: { increment: 1 } } });

      return NextResponse.json(link);
    }

    // Authenticated: list broker's links
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const where: any = {};
    if (session.user.role === 'BROKER') where.brokerId = session.user.id;

    const links = await prisma.shareLink.findMany({
      where,
      include: {
        room: { include: { property: { select: { name: true, district: true, images: true } } } },
        broker: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'BROKER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const token = nanoid(12);

    const link = await prisma.shareLink.create({
      data: {
        roomId: body.roomId,
        brokerId: session.user.id,
        token,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.json({
      ...link,
      url: `${appUrl}/share/${token}`,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.shareLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
