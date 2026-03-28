import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await hash('123456', 12);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@minizen.vn' },
    update: {},
    create: { name: 'Admin Công ty', email: 'admin@minizen.vn', phone: '0901000001', password, role: 'ADMIN' },
  });

  const broker1 = await prisma.user.upsert({
    where: { email: 'broker@minizen.vn' },
    update: {},
    create: { name: 'Nguyễn Văn Môi Giới', email: 'broker@minizen.vn', phone: '0901000002', password, role: 'BROKER' },
  });

  const broker2 = await prisma.user.upsert({
    where: { email: 'broker2@minizen.vn' },
    update: {},
    create: { name: 'Trần Thị Sale', email: 'broker2@minizen.vn', phone: '0901000005', password, role: 'BROKER' },
  });

  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@minizen.vn' },
    update: {},
    create: { name: 'Lê Văn Chủ Nhà', email: 'landlord@minizen.vn', phone: '0901000003', password, role: 'LANDLORD' },
  });

  const landlord2 = await prisma.user.upsert({
    where: { email: 'landlord2@minizen.vn' },
    update: {},
    create: { name: 'Phạm Thị Chủ Nhà', email: 'landlord2@minizen.vn', phone: '0901000006', password, role: 'LANDLORD' },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@minizen.vn' },
    update: {},
    create: { name: 'Hoàng Minh Khách', email: 'customer@minizen.vn', phone: '0901000004', password, role: 'CUSTOMER' },
  });

  console.log('✅ Users created');

  // Create properties
  const prop1 = await prisma.property.create({
    data: {
      landlordId: landlord.id,
      name: 'Chung cư mini Cầu Giấy Premium',
      description: 'Tòa nhà 6 tầng, thang máy, bảo vệ 24/7, ngay gần Indochina Plaza',
      fullAddress: 'Số 12 ngõ 45 Trần Thái Tông, Dịch Vọng, Cầu Giấy, Hà Nội',
      district: 'Cầu Giấy',
      streetName: 'Trần Thái Tông',
      city: 'Hà Nội',
      totalFloors: 6,
      amenities: ['Thang máy', 'Bảo vệ 24/7', 'Gửi xe miễn phí', 'Camera an ninh', 'Wifi tốc độ cao'],
      status: 'APPROVED',
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      landlordId: landlord.id,
      name: 'Nhà trọ Đống Đa Green',
      description: 'Tòa nhà mới xây, khu vực yên tĩnh, gần ĐH Bách Khoa',
      fullAddress: '88 ngõ 159 Phố Chợ Khâm Thiên, Đống Đa, Hà Nội',
      district: 'Đống Đa',
      streetName: 'Khâm Thiên',
      city: 'Hà Nội',
      totalFloors: 5,
      amenities: ['Gửi xe', 'Giặt là', 'Camera'],
      status: 'APPROVED',
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      landlordId: landlord2.id,
      name: 'Mini Apartment Thanh Xuân',
      description: 'Căn hộ mini full nội thất, gần Royal City',
      fullAddress: 'Số 5 ngõ 20 Nguyễn Quý Đức, Thanh Xuân, Hà Nội',
      district: 'Thanh Xuân',
      streetName: 'Nguyễn Quý Đức',
      city: 'Hà Nội',
      totalFloors: 7,
      amenities: ['Thang máy', 'Bảo vệ', 'Máy giặt chung', 'Sân phơi'],
      status: 'APPROVED',
    },
  });

  const prop4 = await prisma.property.create({
    data: {
      landlordId: landlord2.id,
      name: 'HomeStay Ba Đình Central',
      description: 'Vị trí trung tâm, gần Lotte Center, full nội thất cao cấp',
      fullAddress: '15 ngõ 8 Liễu Giai, Ba Đình, Hà Nội',
      district: 'Ba Đình',
      streetName: 'Liễu Giai',
      city: 'Hà Nội',
      totalFloors: 5,
      amenities: ['Thang máy', 'Bảo vệ 24/7', 'Rooftop', 'Smart lock'],
      status: 'PENDING',
    },
  });

  console.log('✅ Properties created');

  // Create rooms
  const roomsData = [
    // Prop 1 rooms
    { propertyId: prop1.id, roomNumber: 'P201', floor: 2, areaSqm: 25, priceMonthly: 3500000, deposit: 3500000, amenities: ['Điều hoà', 'Nóng lạnh', 'WC riêng', 'Ban công'], isAvailable: true, isApproved: true },
    { propertyId: prop1.id, roomNumber: 'P202', floor: 2, areaSqm: 30, priceMonthly: 4200000, deposit: 4200000, amenities: ['Điều hoà', 'Nóng lạnh', 'WC riêng', 'Bếp riêng'], isAvailable: true, isApproved: true },
    { propertyId: prop1.id, roomNumber: 'P301', floor: 3, areaSqm: 25, priceMonthly: 3500000, deposit: 3500000, amenities: ['Điều hoà', 'Nóng lạnh', 'WC riêng'], isAvailable: false, isApproved: true },
    { propertyId: prop1.id, roomNumber: 'P401', floor: 4, areaSqm: 35, priceMonthly: 5000000, deposit: 5000000, amenities: ['Điều hoà', 'Nóng lạnh', 'WC riêng', 'Bếp riêng', 'Ban công'], isAvailable: true, isApproved: true },
    { propertyId: prop1.id, roomNumber: 'P501', floor: 5, areaSqm: 20, priceMonthly: 2800000, deposit: 2800000, amenities: ['Điều hoà', 'Nóng lạnh', 'WC chung'], isAvailable: true, isApproved: true },
    // Prop 2 rooms
    { propertyId: prop2.id, roomNumber: 'P101', floor: 1, areaSqm: 22, priceMonthly: 2500000, deposit: 2500000, amenities: ['Nóng lạnh', 'WC riêng'], isAvailable: true, isApproved: true },
    { propertyId: prop2.id, roomNumber: 'P201', floor: 2, areaSqm: 28, priceMonthly: 3200000, deposit: 3200000, amenities: ['Điều hoà', 'Nóng lạnh', 'WC riêng', 'Giường tủ'], isAvailable: true, isApproved: true },
    { propertyId: prop2.id, roomNumber: 'P301', floor: 3, areaSqm: 28, priceMonthly: 3200000, deposit: 3200000, amenities: ['Điều hoà', 'Nóng lạnh', 'WC riêng'], isAvailable: false, isApproved: true },
    // Prop 3 rooms
    { propertyId: prop3.id, roomNumber: 'S301', floor: 3, areaSqm: 32, priceMonthly: 4500000, deposit: 4500000, amenities: ['Full nội thất', 'Điều hoà', 'Máy giặt riêng', 'Bếp riêng'], isAvailable: true, isApproved: true },
    { propertyId: prop3.id, roomNumber: 'S401', floor: 4, areaSqm: 28, priceMonthly: 3800000, deposit: 3800000, amenities: ['Full nội thất', 'Điều hoà', 'WC riêng'], isAvailable: true, isApproved: true },
    { propertyId: prop3.id, roomNumber: 'S501', floor: 5, areaSqm: 40, priceMonthly: 6000000, deposit: 6000000, amenities: ['Studio', 'Full nội thất', 'Điều hoà', 'Bếp riêng', 'Ban công'], isAvailable: true, isApproved: true },
    { propertyId: prop3.id, roomNumber: 'S601', floor: 6, areaSqm: 22, priceMonthly: 2800000, deposit: 2800000, amenities: ['Điều hoà', 'WC riêng'], isAvailable: false, isApproved: true },
  ];

  for (const room of roomsData) {
    await prisma.room.create({ data: room });
  }

  console.log('✅ Rooms created');

  // Create some deals
  const room1 = await prisma.room.findFirst({ where: { roomNumber: 'P301', propertyId: prop1.id } });
  const room2 = await prisma.room.findFirst({ where: { roomNumber: 'P301', propertyId: prop2.id } });
  const room3 = await prisma.room.findFirst({ where: { roomNumber: 'S601', propertyId: prop3.id } });

  if (room1) {
    await prisma.deal.create({
      data: {
        roomId: room1.id, brokerId: broker1.id, customerName: 'Nguyễn Minh Tuấn', customerPhone: '0987654321',
        dealPrice: 3500000, commissionTotal: 1750000, commissionBroker: 1050000, commissionCompany: 700000,
        commissionRate: 60, status: 'CONFIRMED', confirmedAt: new Date(),
      },
    });
  }

  if (room2) {
    await prisma.deal.create({
      data: {
        roomId: room2.id, brokerId: broker1.id, customerName: 'Lê Thị Hoa', customerPhone: '0912333444',
        dealPrice: 3200000, commissionTotal: 1600000, commissionBroker: 960000, commissionCompany: 640000,
        commissionRate: 60, status: 'PAID', confirmedAt: new Date(),
      },
    });
  }

  if (room3) {
    await prisma.deal.create({
      data: {
        roomId: room3.id, brokerId: broker2.id, customerName: 'Trần Văn Đức', customerPhone: '0977888999',
        dealPrice: 2800000, commissionTotal: 1400000, commissionBroker: 840000, commissionCompany: 560000,
        commissionRate: 60, status: 'PENDING',
      },
    });
  }

  console.log('✅ Deals created');

  // Create share links
  const availableRooms = await prisma.room.findMany({ where: { isAvailable: true }, take: 3 });
  for (const room of availableRooms) {
    await prisma.shareLink.create({
      data: {
        roomId: room.id,
        brokerId: broker1.id,
        token: `demo${room.roomNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.random().toString(36).slice(2, 6)}`,
        viewCount: Math.floor(Math.random() * 50),
      },
    });
  }

  console.log('✅ Share links created');

  // Settings
  await prisma.setting.upsert({
    where: { key: 'commission_broker_percent' },
    update: {},
    create: { key: 'commission_broker_percent', value: '60' },
  });

  console.log('✅ Settings created');
  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Demo accounts (password: 123456):');
  console.log('   Admin:    admin@minizen.vn');
  console.log('   Broker:   broker@minizen.vn');
  console.log('   Landlord: landlord@minizen.vn');
  console.log('   Customer: customer@minizen.vn');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
