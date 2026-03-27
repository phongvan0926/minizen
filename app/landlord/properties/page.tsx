'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function LandlordPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', fullAddress: '', district: '', streetName: '', city: 'Hà Nội',
    totalFloors: '5', description: '', amenities: '', zaloPhone: '', landlordNotes: '',
    parkingCar: false, parkingBike: true, evCharging: false, petAllowed: false, foreignerOk: false,
  });

  const fetchData = async () => {
    const [propsRes, statsRes] = await Promise.all([
      fetch('/api/properties'), fetch('/api/dashboard-stats'),
    ]);
    setProperties(await propsRes.json());
    setStats(await statsRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/properties', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      toast.success('Đã gửi! Chờ Admin duyệt.');
      setShowForm(false);
      fetchData();
    }
  };

  const set = (key: string, val: any) => setForm({ ...form, [key]: val });

  if (loading) return <div className="animate-pulse text-stone-400 p-8">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Tòa nhà của tôi</h1>
          <p className="text-sm text-stone-500 mt-1">{properties.length} tòa nhà</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Đóng' : '+ Thêm tòa nhà'}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card"><p className="text-xs font-medium text-stone-500 uppercase">Tòa nhà</p><p className="text-xl font-bold mt-1">{stats.totalProperties}</p></div>
          <div className="stat-card"><p className="text-xs font-medium text-stone-500 uppercase">Tổng phòng</p><p className="text-xl font-bold mt-1">{stats.totalRooms}</p></div>
          <div className="stat-card"><p className="text-xs font-medium text-stone-500 uppercase">Phòng trống</p><p className="text-xl font-bold mt-1 text-emerald-600">{stats.availableRooms}</p></div>
          <div className="stat-card"><p className="text-xs font-medium text-stone-500 uppercase">Lượt xem</p><p className="text-xl font-bold mt-1 text-brand-600">{stats.totalViews}</p></div>
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Đăng tòa nhà mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tên tòa nhà *</label>
                <input className="input-field" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="VD: Nhà trọ Minh Khai" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Quận / Huyện *</label>
                <input className="input-field" required value={form.district} onChange={e => set('district', e.target.value)} placeholder="Hai Bà Trưng" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tên đường *</label>
                <input className="input-field" required value={form.streetName} onChange={e => set('streetName', e.target.value)} placeholder="Minh Khai" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Địa chỉ chi tiết *</label>
                <input className="input-field" required value={form.fullAddress} onChange={e => set('fullAddress', e.target.value)} placeholder="Số nhà, ngõ, ngách..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Số tầng</label>
                <input type="number" className="input-field" value={form.totalFloors} onChange={e => set('totalFloors', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">SĐT Zalo (để MG liên hệ)</label>
                <input className="input-field" value={form.zaloPhone} onChange={e => set('zaloPhone', e.target.value)} placeholder="0912345678" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Tiện ích chung (phẩy cách)</label>
                <input className="input-field" value={form.amenities} onChange={e => set('amenities', e.target.value)} placeholder="Thang máy, Camera, Bảo vệ, Wifi" />
              </div>
            </div>

            {/* Feature toggles */}
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Đặc điểm tòa nhà</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'parkingCar', label: '🚗 Ô tô đỗ cửa', active: form.parkingCar },
                  { key: 'evCharging', label: '⚡ Sạc xe điện', active: form.evCharging },
                  { key: 'petAllowed', label: '🐾 Nuôi thú cưng', active: form.petAllowed },
                  { key: 'foreignerOk', label: '🌍 Cho người nước ngoài', active: form.foreignerOk },
                ].map(f => (
                  <button key={f.key} type="button" onClick={() => set(f.key, !f.active)}
                    className={'px-4 py-2 rounded-xl text-sm font-medium border transition-all ' +
                      (f.active ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-stone-200 text-stone-500')}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Lưu ý cho môi giới</label>
              <textarea className="input-field" rows={2} value={form.landlordNotes} onChange={e => set('landlordNotes', e.target.value)}
                placeholder="VD: Ưu tiên khách ở lâu dài, không nhận khách ở ngắn hạn..." />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Gửi duyệt</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Huỷ</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {properties.map((p: any) => (
          <div key={p.id} className="card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-stone-500">{p.fullAddress}</p>
                <p className="text-sm text-stone-500">{p.district} • {p.totalFloors} tầng</p>
              </div>
              <span className={'badge ' + getStatusColor(p.status)}>{getStatusLabel(p.status)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-stone-100 text-sm">
              <span className="text-stone-500">Phòng: <span className="font-medium text-emerald-600">{p.rooms?.filter((r: any) => r.isAvailable).length} trống</span> / {p.rooms?.length}</span>
              {p.zaloPhone && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Zalo: {p.zaloPhone}</span>}
              {p.parkingCar && <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">🚗</span>}
              {p.petAllowed && <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">🐾</span>}
              {p.foreignerOk && <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">🌍</span>}
              {p.evCharging && <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">⚡</span>}
            </div>
          </div>
        ))}
        {properties.length === 0 && (
          <div className="text-center py-16 text-stone-400 card">
            <p className="text-4xl mb-3">🏠</p><p>Nhấn <strong>+ Thêm tòa nhà</strong> để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
