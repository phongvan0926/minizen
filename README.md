# 🏢 MiniZen Manager

Nền tảng quản lý chung cư mini — kết nối Chủ nhà, Môi giới, Công ty và Khách thuê.

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **Auth:** NextAuth.js (JWT, multi-role)
- **Deploy:** Vercel

## Tính năng

### 👨‍💼 Admin (Công ty)
- Dashboard tổng quan (thống kê, doanh thu)
- CRUD tòa nhà & phòng
- Duyệt sản phẩm chủ nhà đăng
- Quản lý giao dịch & tính hoa hồng tự động
- Cấu hình tỷ lệ chia hoa hồng
- Quản lý tài khoản người dùng

### 🤝 Môi giới
- Xem kho phòng trống (lọc theo khu vực, giá)
- Xem SĐT chủ nhà & địa chỉ chi tiết
- Tạo link chia sẻ cho khách (ẩn thông tin nhạy cảm)
- Báo deal & theo dõi hoa hồng
- Quản lý link đã chia sẻ

### 🏠 Chủ nhà
- Tự đăng tòa nhà & phòng
- Bật/tắt trạng thái phòng (còn/hết)
- Theo dõi lượt xem

### 👤 Khách thuê
- Xem chi tiết phòng qua link chia sẻ
- Thấy khu vực & tuyến phố (KHÔNG thấy địa chỉ cụ thể & SĐT chủ nhà)
- Liên hệ qua môi giới

---

## 🚀 Hướng dẫn Deploy từ A-Z

### Bước 1: Tạo Supabase Database (miễn phí)

1. Vào https://supabase.com → Sign Up → New Project
2. Chọn Region: **Southeast Asia (Singapore)** cho tốc độ
3. Đặt tên project, tạo Database Password (LƯU LẠI)
4. Đợi ~2 phút để project khởi tạo
5. Vào **Settings → Database** → copy:
   - Connection string (Pooling): `postgresql://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres`
   - Direct connection: `postgresql://postgres.[ref]:[password]@...supabase.com:5432/postgres`
6. Vào **Settings → API** → copy:
   - Project URL: `https://xxx.supabase.co`
   - `anon` public key
   - `service_role` key

### Bước 2: Tạo Supabase Storage Bucket (cho upload ảnh)

1. Trong Supabase Dashboard → **Storage** → New Bucket
2. Tên: `images`, Public bucket: ✅
3. Vào bucket → Policies → New Policy → Allow all cho authenticated users

### Bước 3: Push code lên GitHub

```bash
# Clone hoặc copy project
cd minizen

# Init git
git init
git add .
git commit -m "Initial commit - MiniZen Manager"

# Tạo repo trên GitHub (github.com/new)
git remote add origin https://github.com/YOUR_USERNAME/minizen.git
git branch -M main
git push -u origin main
```

### Bước 4: Deploy lên Vercel (miễn phí)

1. Vào https://vercel.com → Sign Up bằng GitHub
2. **Add New → Project** → Import repo `minizen`
3. **Environment Variables** → thêm từng biến:

```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=chay-lenh-openssl-rand-base64-32
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...
NEXT_PUBLIC_APP_NAME=MiniZen
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

4. **Deploy** → đợi ~2-3 phút

### Bước 5: Setup Database

```bash
# Cài dependencies local
npm install

# Copy .env.example → .env rồi điền thông tin
cp .env.example .env

# Push schema lên Supabase
npx prisma db push

# Seed dữ liệu demo
npm run db:seed
```

### Bước 6: Kiểm tra

1. Vào `https://your-app.vercel.app`
2. Đăng nhập với tài khoản demo (mật khẩu: `123456`):
   - Admin: `admin@minizen.vn`
   - Môi giới: `broker@minizen.vn`
   - Chủ nhà: `landlord@minizen.vn`

---

## 🔧 Chạy Local (Development)

```bash
# 1. Clone repo
git clone https://github.com/YOUR_USERNAME/minizen.git
cd minizen

# 2. Cài dependencies
npm install

# 3. Setup env
cp .env.example .env
# Điền thông tin Supabase vào .env

# 4. Setup database
npx prisma db push
npm run db:seed

# 5. Chạy dev server
npm run dev
# → http://localhost:3000
```

## 📁 Cấu trúc thư mục

```
minizen/
├── app/
│   ├── admin/           # Admin dashboard pages
│   ├── broker/          # Broker pages
│   ├── landlord/        # Landlord pages
│   ├── share/[token]/   # Public share page (khách xem)
│   ├── api/             # API routes
│   ├── login/           # Login page
│   ├── register/        # Register page
│   └── page.tsx         # Landing page
├── components/
│   └── layout/          # Dashboard layout, AuthProvider
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Helper functions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Demo data
└── middleware.ts         # Route protection
```

## 🔐 Phân quyền dữ liệu

| Thông tin | Admin | Môi giới | Chủ nhà | Khách (qua link) |
|-----------|:-----:|:--------:|:-------:|:-----------------:|
| Ảnh phòng | ✅ | ✅ | ✅ | ✅ |
| Giá thuê | ✅ | ✅ | ✅ | ✅ |
| Tiện ích | ✅ | ✅ | ✅ | ✅ |
| Khu vực / Quận | ✅ | ✅ | ✅ | ✅ |
| Tuyến phố | ✅ | ✅ | ✅ | ✅ |
| Địa chỉ chi tiết | ✅ | ✅ | ✅ | ❌ |
| SĐT Chủ nhà | ✅ | ✅ | — | ❌ |
| Hoa hồng | ✅ | Của mình | ❌ | ❌ |

## Tài khoản Demo

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | admin@minizen.vn | 123456 |
| Môi giới | broker@minizen.vn | 123456 |
| Chủ nhà | landlord@minizen.vn | 123456 |
| Khách | customer@minizen.vn | 123456 |
