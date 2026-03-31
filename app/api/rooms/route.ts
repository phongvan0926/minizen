import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const propertyId = url.searchParams.get('propertyId');
    const available = url.searchParams.get('available');
    const district = url.searchParams.get('district');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const search = url.searchParams.get('search');

    const roomType = url.searchParams.get('roomType');
    const parkingCar = url.searchParams.get('parkingCar');
    const foreignerOk = url.searchParams.get('foreignerOk');
    const evCharging = url.searchParams.get('evCharging');
    const petAllowed = url.searchParams.get('petAllowed');

    const where: any = { isApproved: true };

    if (propertyId) where.propertyId = propertyId;
    if (available === 'true') where.isAvailable = true;
    if (available === 'false') where.isAvailable = false;
    if (roomType) where.roomType = roomType;
    if (minPrice) where.priceMonthly = { ...where.priceMonthly, gte: parseFloat(minPrice) };
    if (maxPrice) where.priceMonthly = { ...where.priceMonthly, lte: parseFloat(maxPrice) };

    // Property-level filters
    const propertyWhere: any = {};
    if (district) propertyWhere.district = { contains: district, mode: 'insensitive' };
    if (parkingCar === 'true') propertyWhere.parkingCar = true;
    if (foreignerOk === 'true') propertyWhere.foreignerOk = true;
    if (evCharging === 'true') propertyWhere.evCharging = true;
    if (petAllowed === 'true') propertyWhere.petAllowed = true;

    if (Object.keys(propertyWhere).length > 0) {
      where.property = { ...where.property, ...propertyWhere };
    }
    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { property: { name: { contains: search, mode: 'insensitive' } } },
        { property: { district: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // For landlord, show their own rooms regardless of approval
    if (session?.user?.role === 'LANDLORD') {
      delete where.isApproved;
      where.property = { ...where.property, landlordId: session.user.id };
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        property: {
          include: {
            landlord: {
              select: {
                id: true, name: true,
                phone: session?.user?.role === 'ADMIN' || session?.user?.role === 'BROKER',
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Strip sensitive data for non-broker/admin users
    const sanitized = rooms.map(room => {
      const isBrokerOrAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'BROKER';
      return {
        ...room,
        property: {
          ...room.property,
          fullAddress: isBrokerOrAdmin ? room.property.fullAddress : undefined,
          latitude: isBrokerOrAdmin ? room.property.latitude : undefined,
          longitude: isBrokerOrAdmin ? room.property.longitude : undefined,
        },
      };
    });

    return NextResponse.json(sanitized);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const room = await prisma.room.create({
      data: {
        propertyId: body.propertyId,
        roomNumber: body.roomNumber,
        floor: parseInt(body.floor) || 1,
        roomType: body.roomType || 'don',
        areaSqm: parseFloat(body.areaSqm),
        priceMonthly: parseFloat(body.priceMonthly),
        deposit: parseFloat(body.deposit) || 0,
        description: body.description,
        amenities: body.amenities || [],
        images: body.images || [],
        commissionJson: body.commissionJson || null,
        landlordNotes: body.landlordNotes || null,
        isAvailable: body.isAvailable ?? true,
        isApproved: session.user.role === 'ADMIN' ? (body.isApproved ?? true) : false,
      },
    });

    return NextResponse.json(room, { status: 201 });
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

    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(data.propertyId && { propertyId: data.propertyId }),
        ...(data.roomNumber && { roomNumber: data.roomNumber }),
        ...(data.floor && { floor: parseInt(data.floor) }),
        ...(data.roomType && { roomType: data.roomType }),
        ...(data.areaSqm && { areaSqm: parseFloat(data.areaSqm) }),
        ...(data.priceMonthly && { priceMonthly: parseFloat(data.priceMonthly) }),
        ...(data.deposit !== undefined && { deposit: parseFloat(data.deposit) }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.amenities && { amenities: data.amenities }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.commissionJson !== undefined && { commissionJson: data.commissionJson }),
        ...(data.landlordNotes !== undefined && { landlordNotes: data.landlordNotes }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
        ...(data.isApproved !== undefined && { isApproved: data.isApproved }),
      },
    });

    return NextResponse.json(room);
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

    await prisma.room.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
