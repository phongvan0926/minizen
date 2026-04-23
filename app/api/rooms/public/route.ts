import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPaginationParams, paginatedResponse } from '@/lib/pagination';
import { applyRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const rateLimited = applyRateLimit(req, 'api');
  if (rateLimited) return rateLimited;

  try {
    const url = new URL(req.url);
    const district = url.searchParams.get('district');
    const typeName = url.searchParams.get('typeName');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');

    const featureFlags = {
      parkingCar: url.searchParams.get('parkingCar') === 'true',
      parkingBike: url.searchParams.get('parkingBike') === 'true',
      evCharging: url.searchParams.get('evCharging') === 'true',
      petAllowed: url.searchParams.get('petAllowed') === 'true',
      foreignerOk: url.searchParams.get('foreignerOk') === 'true',
    };

    const propertyWhere: any = { status: 'APPROVED', isActive: true };
    if (district) propertyWhere.district = { contains: district, mode: 'insensitive' };
    if (featureFlags.parkingCar) propertyWhere.parkingCar = true;
    if (featureFlags.parkingBike) propertyWhere.parkingBike = true;
    if (featureFlags.evCharging) propertyWhere.evCharging = true;
    if (featureFlags.petAllowed) propertyWhere.petAllowed = true;
    if (featureFlags.foreignerOk) propertyWhere.foreignerOk = true;

    const where: any = {
      isApproved: true,
      isAvailable: true,
      availableUnits: { gt: 0 },
      property: propertyWhere,
    };

    if (typeName) where.typeName = typeName;
    if (minPrice) where.priceMonthly = { ...where.priceMonthly, gte: parseFloat(minPrice) };
    if (maxPrice) where.priceMonthly = { ...where.priceMonthly, lte: parseFloat(maxPrice) };

    const { page, limit, skip } = getPaginationParams(url);

    const [roomTypes, total, activeShareLinks] = await Promise.all([
      prisma.roomType.findMany({
        where,
        select: {
          id: true,
          name: true,
          typeName: true,
          areaSqm: true,
          priceMonthly: true,
          deposit: true,
          amenities: true,
          images: true,
          videos: true,
          videoLinks: true,
          availableUnits: true,
          shortTermAllowed: true,
          property: {
            select: {
              name: true,
              district: true,
              streetName: true,
              city: true,
              images: true,
              parkingCar: true,
              parkingBike: true,
              evCharging: true,
              petAllowed: true,
              foreignerOk: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.roomType.count({ where }),
      prisma.shareLink.findMany({
        where: { isActive: true, isSystem: false, roomTypeId: { not: null } },
        select: { roomTypeId: true, token: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const tokenByRoomType = new Map<string, string>();
    for (const link of activeShareLinks) {
      if (link.roomTypeId && !tokenByRoomType.has(link.roomTypeId)) {
        tokenByRoomType.set(link.roomTypeId, link.token);
      }
    }

    const withShareToken = roomTypes.map(rt => {
      const images = [...(rt.images || []), ...(rt.property?.images || [])].slice(0, 3);
      const hasVideo = (rt.videos?.length || 0) + (rt.videoLinks?.length || 0) > 0;
      return {
        id: rt.id,
        name: rt.name,
        typeName: rt.typeName,
        areaSqm: rt.areaSqm,
        priceMonthly: rt.priceMonthly,
        deposit: rt.deposit,
        amenities: rt.amenities,
        images,
        hasVideo,
        videoLinks: rt.videoLinks || [],
        availableUnits: rt.availableUnits,
        shortTermAllowed: rt.shortTermAllowed,
        property: rt.property,
        shareToken: tokenByRoomType.get(rt.id) || null,
      };
    });

    return NextResponse.json(paginatedResponse(withShareToken, total, page, limit));
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
