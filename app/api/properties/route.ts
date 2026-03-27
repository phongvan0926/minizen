import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const landlordId = url.searchParams.get('landlordId');
    const search = url.searchParams.get('search');

    const where: any = {};

    if (session?.user?.role === 'LANDLORD') {
      where.landlordId = session.user.id;
    } else if (landlordId) {
      where.landlordId = landlordId;
    }

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { streetName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        landlord: { select: { id: true, name: true, phone: true, email: true } },
        rooms: { select: { id: true, isAvailable: true, priceMonthly: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const landlordId = session.user.role === 'LANDLORD' ? session.user.id : body.landlordId;

    const property = await prisma.property.create({
      data: {
        landlordId,
        name: body.name,
        description: body.description,
        fullAddress: body.fullAddress,
        district: body.district,
        streetName: body.streetName,
        city: body.city || 'Hà Nội',
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        totalFloors: parseInt(body.totalFloors) || 1,
        amenities: body.amenities || [],
        images: body.images || [],
        status: session.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, ...data } = body;

    // Verify ownership
    if (session.user.role === 'LANDLORD') {
      const prop = await prisma.property.findFirst({ where: { id, landlordId: session.user.id } });
      if (!prop) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.fullAddress && { fullAddress: data.fullAddress }),
        ...(data.district && { district: data.district }),
        ...(data.streetName && { streetName: data.streetName }),
        ...(data.totalFloors && { totalFloors: parseInt(data.totalFloors) }),
        ...(data.amenities && { amenities: data.amenities }),
        ...(data.images && { images: data.images }),
        ...(data.status && { status: data.status }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json(property);
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

    if (session.user.role !== 'ADMIN') {
      const prop = await prisma.property.findFirst({ where: { id, landlordId: session.user.id } });
      if (!prop) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
