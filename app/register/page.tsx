'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'BROKER' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const set = (key: string, val: string) => setForm({ ...form, [key]: val });

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="font-display font-bold text-xl">MiniZen</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Tạo tài khoản</h1>
          <p className="text-stone-500 text-sm mt-1">Tham gia nền tảng quản lý chung cư mini</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Bạn là</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'BROKER', label: '🤝 Môi giới' },
                  { value: 'LANDLORD', label: '🏠 Chủ nhà' },
                  { value: 'CUSTOMER', label: '👤 Khách thuê' },
                ].map(r => (
                  <button key={r.value} type="button" onClick={() => set('role', r.value)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.role === r.value
                        ? 'bg-brand-50 border-brand-200 text-brand-700'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Họ tên</label>
              <input type="text" className="input-field" placeholder="Nguyễn Văn A" required
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="email@example.com" required
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Số điện thoại</label>
              <input type="tel" className="input-field" placeholder="0912 345 678"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Mật khẩu</label>
              <input type="password" className="input-field" placeholder="Tối thiểu 6 ký tự" required minLength={6}
                value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
