'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminPropertiesPage() {
  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', fullAddress: '', district: '', streetName: '', city: 'Hà Nội',
    totalFloors: '5', description: '', amenities: '',
  });

  const fetchData = async () => {
    const [statsRes, propsRes] = await Promise.all([
      fetch('/api/dashboard-stats'), fetch('/api/properties'),
    ]);
    setStats(await statsRes.json());
    setProperties(await propsRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string, status: string) => {
    await fetch('/api/properties', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    toast.success(status === 'APPROVED' ? 'Đã duyệt!' : 'Đã từ chối');
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      toast.success('Đã thêm tòa nhà!');
      setShowForm(false);
      setForm({ name: '', fullAddress: '', district: '', streetName: '', city: 'Hà Nội', totalFloors: '5', description: '', amenities: '' });
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xoá?')) return;
    await fetch(`/api/properties?id=${id}`, { method: 'DELETE' });
    toast.success('Đã xoá!');
    fetchData();
  };

  if (loading) return <div className="animate-pulse text-stone-400 p-8">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Tổng quan</h1>
          <p className="text-sm text-stone-500 mt-1">Quản lý toàn bộ hệ thống</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Đóng' : '+ Thêm tòa nhà'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng tòa nhà', value: stats.totalProperties, color: 'text-brand-600' },
            { label: 'Phòng trống', value: `${stats.availableRooms}/${stats.totalRooms}`, color: 'text-emerald-600' },
            { label: 'Chờ duyệt', value: stats.pendingProperties, color: 'text-amber-600' },
            { label: 'Doanh thu HH', value: formatCurrency(stats.totalRevenue), color: 'text-purple-600' },
            { label: 'Giao dịch', value: `${stats.confirmedDeals}/${stats.totalDeals}`, color: 'text-blue-600' },
            { label: 'Môi giới', value: stats.totalBrokers, color: 'text-orange-600' },
            { label: 'Chủ nhà', value: stats.totalLandlords, color: 'text-amber-600' },
            { label: 'Tổng HH', value: formatCurrency(stats.totalCommission), color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Thêm tòa nhà mới</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tên tòa nhà *</label>
              <input className="input-field" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Chung cư mini Cầu Giấy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Quận / Huyện *</label>
              <input className="input-field" required value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="VD: Cầu Giấy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tên đường / Phố *</label>
              <input className="input-field" required value={form.streetName} onChange={e => setForm({ ...form, streetName: e.target.value })} placeholder="VD: Trần Thái Tông" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Địa chỉ chi tiết *</label>
              <input className="input-field" required value={form.fullAddress} onChange={e => setForm({ ...form, fullAddress: e.target.value })} placeholder="VD: Số 12 ngõ 45 Trần Thái Tông" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Số tầng</label>
              <input type="number" className="input-field" value={form.totalFloors} onChange={e => setForm({ ...form, totalFloors: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tiện ích (phẩy cách)</label>
              <input className="input-field" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="VD: Thang máy, Bảo vệ 24/7, Gửi xe" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả</label>
              <textarea className="input-field" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả thêm về tòa nhà..." />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Thêm tòa nhà</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Huỷ</button>
            </div>
          </form>
        </div>
      )}

      {/* Properties table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-stone-100">
          <h2 className="font-display font-semibold">Danh sách tòa nhà ({properties.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50/80">
              <tr>
                <th className="table-header">Tên</th>
                <th className="table-header">Khu vực</th>
                <th className="table-header">Chủ nhà</th>
                <th className="table-header">Phòng</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {properties.map((p: any) => (
                <tr key={p.id} className="hover:bg-stone-50/50">
                  <td className="table-cell">
                    <p className="font-medium text-stone-900">{p.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{p.fullAddress}</p>
                  </td>
                  <td className="table-cell">{p.district}</td>
                  <td className="table-cell">
                    <p className="text-stone-900">{p.landlord.name}</p>
                    <p className="text-xs text-stone-500">{p.landlord.phone}</p>
                  </td>
                  <td className="table-cell">
                    <span className="text-emerald-600 font-medium">{p.rooms.filter((r: any) => r.isAvailable).length}</span>
                    <span className="text-stone-400">/{p.rooms.length}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      {p.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(p.id, 'APPROVED')} className="text-xs text-emerald-600 hover:underline">Duyệt</button>
                          <button onClick={() => handleApprove(p.id, 'REJECTED')} className="text-xs text-red-600 hover:underline">Từ chối</button>
                        </>
                      )}
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr><td colSpan={6} className="table-cell text-center text-stone-400 py-12">Chưa có tòa nhà nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
