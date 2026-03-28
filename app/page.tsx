import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-display font-semibold text-lg">MiniZen</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">Đăng nhập</Link>
            <Link href="/register" className="btn-primary">Đăng ký</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-4 py-1.5 text-sm text-brand-700 font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Nền tảng quản lý chung cư mini #1
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-stone-900 mb-6 leading-[1.1]">
            Kết nối <span className="text-brand-600">Chủ nhà</span>,{' '}
            <span className="text-brand-600">Môi giới</span> &{' '}
            <span className="text-brand-600">Khách thuê</span>
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Quản lý kho phòng, chia sẻ link thông minh, tự động tính hoa hồng.
            Mọi thứ trong một nền tảng duy nhất.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base px-8 py-3">
              Bắt đầu miễn phí
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3">Đăng nhập</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold mb-3">4 vai trò, 1 nền tảng</h2>
            <p className="text-stone-500">Mỗi người dùng có giao diện và quyền truy cập riêng biệt</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🏢', title: 'Công ty', desc: 'Quản lý toàn bộ sản phẩm, duyệt phòng, tính hoa hồng tự động', color: 'bg-emerald-50 border-emerald-100' },
              { icon: '🤝', title: 'Môi giới', desc: 'Xem kho phòng trống, tạo link chia sẻ, theo dõi deal & hoa hồng', color: 'bg-orange-50 border-orange-100' },
              { icon: '🏠', title: 'Chủ nhà', desc: 'Tự đăng sản phẩm, bật/tắt phòng, theo dõi lượt xem', color: 'bg-amber-50 border-amber-100' },
              { icon: '👤', title: 'Khách thuê', desc: 'Xem chi tiết phòng, khu vực — không thấy địa chỉ & SĐT chủ nhà', color: 'bg-blue-50 border-blue-100' },
            ].map((f) => (
              <div key={f.title} className={`rounded-2xl border p-6 ${f.color} transition-all hover:shadow-md`}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white border-y border-stone-200/60">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-14">Cách hoạt động</h2>
          <div className="space-y-8">
            {[
              { step: '01', title: 'Chủ nhà đăng phòng', desc: 'Upload ảnh, thông tin phòng, giá thuê. Admin duyệt trước khi hiển thị.' },
              { step: '02', title: 'Môi giới xem kho hàng', desc: 'Lọc phòng theo khu vực, giá. Xem đầy đủ địa chỉ & SĐT chủ nhà.' },
              { step: '03', title: 'Tạo link gửi khách', desc: 'Link thông minh ẩn thông tin nhạy cảm. Đếm lượt xem tự động.' },
              { step: '04', title: 'Chốt deal & tính hoa hồng', desc: 'Ghi nhận giao dịch, tự động chia hoa hồng giữa môi giới & công ty.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center font-display font-bold text-brand-600">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-stone-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center text-sm text-stone-400">
        <p>&copy; 2024 MiniZen. Xây dựng với Next.js & Supabase.</p>
      </footer>
    </div>
  );
}
