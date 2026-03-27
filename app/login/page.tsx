'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn('credentials', { ...form, redirect: false });
      if (res?.error) {
        toast.error('Email hoặc mật khẩu không đúng');
      } else {
        toast.success('Đăng nhập thành công!');
        // Fetch session to get role
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        const role = session?.user?.role;
        if (role === 'ADMIN') router.push('/admin/properties');
        else if (role === 'BROKER') router.push('/broker/inventory');
        else if (role === 'LANDLORD') router.push('/landlord/properties');
        else router.push('/');
      }
    } catch { toast.error('Có lỗi xảy ra'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="font-display font-bold text-xl">MiniAppart</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Đăng nhập</h1>
          <p className="text-stone-500 text-sm mt-1">Chào mừng bạn trở lại</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="email@example.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Mật khẩu</label>
              <input type="password" className="input-field" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-brand-600 font-medium hover:underline">Đăng ký</Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 card p-5">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Tài khoản demo</p>
          <div className="space-y-2">
            {[
              { role: 'Admin', email: 'admin@miniappart.vn' },
              { role: 'Môi giới', email: 'broker@miniappart.vn' },
              { role: 'Chủ nhà', email: 'landlord@miniappart.vn' },
            ].map(d => (
              <button key={d.role} onClick={() => { setForm({ email: d.email, password: '123456' }); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-stone-50 transition-colors flex justify-between items-center group">
                <span className="text-stone-700">{d.role}</span>
                <span className="text-stone-400 text-xs group-hover:text-brand-600">{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
