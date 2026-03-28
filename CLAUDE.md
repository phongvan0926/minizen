# CLAUDE.md - Hướng dẫn cho Claude Code

## Dự án
MiniAppart Manager v2 - Nền tảng phân phối & quản lý chung cư mini.
Kết nối 4 vai trò: Admin (Công ty), Môi giới, Chủ nhà, Khách thuê.

## Tech stack
- Next.js 14 + React 18 + Tailwind CSS
- Prisma ORM + PostgreSQL (Supabase)
- NextAuth.js (JWT, multi-role: ADMIN, BROKER, LANDLORD, CUSTOMER)
- Deploy: Vercel

## Cấu trúc quan trọng
```
app/admin/          → Trang quản trị (properties, rooms, deals, users, settings)
app/broker/         → Trang môi giới (inventory, deals, share-links)
app/landlord/       → Trang chủ nhà (properties, rooms)
app/share/[token]/  → Trang khách xem phòng (public, ẩn địa chỉ + SĐT)
app/api/            → API routes (properties, rooms, deals, share-links, inquiries, notifications, users, settings)
components/layout/  → DashboardLayout.tsx (sidebar + topbar), AuthProvider.tsx
lib/auth.ts         → NextAuth config
lib/prisma.ts       → Prisma client singleton
lib/utils.ts        → Helpers: formatCurrency, formatDate, getStatusColor...
prisma/schema.prisma → 8 bảng: users, properties, rooms, deals, share_links, room_inquiries, notifications, settings
prisma/seed.ts      → Demo data (password: 123456)
middleware.ts       → Route protection theo role
```

## Database schema tóm tắt
- users: id, name, email, phone, password, role (ADMIN/BROKER/LANDLORD/CUSTOMER), isActive
- properties: id, landlordId, name, fullAddress, district, streetName, zaloPhone, landlordNotes, parkingCar, evCharging, petAllowed, foreignerOk, status (PENDING/APPROVED/REJECTED)
- rooms: id, propertyId, roomNumber, floor, areaSqm, priceMonthly, deposit, roomType (don/gac_xep/1k1n/2k1n/studio/duplex), commissionJson, landlordNotes, isAvailable, isApproved, amenities[]
- deals: id, roomId, brokerId, dealPrice, commissionTotal, commissionBroker, commissionCompany, status (PENDING/CONFIRMED/PAID/CANCELLED)
- share_links: id, roomId, brokerId, token (unique), viewCount
- room_inquiries: id, roomId, brokerId, message, reply (CÒN/HẾT), repliedAt
- notifications: id, userId, type, title, message, isRead
- settings: key-value (commission_broker_percent)

## Phân quyền dữ liệu
- Môi giới: thấy fullAddress + SĐT/Zalo chủ nhà + hoa hồng + lưu ý
- Khách (qua share link): chỉ thấy district, streetName, amenities — KHÔNG thấy fullAddress, SĐT
- Chủ nhà: tự set commissionJson, zaloPhone, landlordNotes, bật/tắt isAvailable
- Admin: thấy tất cả, duyệt property/room, xác nhận deal

## Quy tắc khi sửa code
- CSS: dùng Tailwind classes, custom classes trong app/globals.css (btn-primary, input-field, card, badge, stat-card, sidebar-link...)
- Font: Be Vietnam Pro (body), Space Grotesk (headings)
- Color: brand-50 đến brand-950 (xanh dương), stone-50 đến stone-900 (neutral)
- API: tất cả dùng getServerSession(authOptions) để check role
- Format tiền: dùng formatCurrency() từ lib/utils.ts
- Toast: dùng react-hot-toast (toast.success, toast.error)
- Mỗi lần thay đổi tính năng → cập nhật file README.md cho đồng bộ

## Lệnh thường dùng
- `npm run dev` → chạy dev server (localhost:3000)
- `npx prisma db push` → đồng bộ schema lên database
- `npx prisma generate` → generate Prisma client
- `npm run db:seed` → seed demo data
- `npx prisma studio` → mở GUI xem database
