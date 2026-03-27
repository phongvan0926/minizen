'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    propertyId: '', roomNumber: '', floor: '1', areaSqm: '', priceMonthly: '', deposit: '0', description: '', amenities: '',
  });

  const fetchData = async () => {
    const [roomsRes, propsRes] = await Promise.all([
      fetch('/api/rooms'), fetch('/api/properties?status=APPROVED'),
    ]);
    setRooms(await roomsRes.json());
    setProperties(await propsRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean) }),
    });
    if (res.ok) { toast.success('Đã thêm phòng!'); setShowForm(false); fetchData(); }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await fetch('/api/rooms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isAvailable: !current }),
    });
    toast.success(!current ? 'Đã bật phòng' : 'Đã tắt phòng');
    fetchData();
  };

  const toggleApproval = async (id: string, current: boolean) => {
    await fetch('/api/rooms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isApproved: !current }),
    });
    toast.success(!current ? 'Đã duyệt phòng' : 'Đã huỷ duyệt');
    fetchData();
  };

  if (loading) return <div className="animate-pulse text-stone-400 p-8">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Quản lý phòng</h1>
          <p className="text-sm text-stone-500 mt-1">{rooms.length} phòng</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Đóng' : '+ Thêm phòng'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Thêm phòng mới</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tòa nhà *</label>
              <select className="input-field" required value={form.propertyId} onChange={e => setForm({ ...form, propertyId: e.target.value })}>
                <option value="">Chọn tòa nhà</option>
                {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name} - {p.district}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Số phòng *</label>
              <input className="input-field" required value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} placeholder="VD: P201" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tầng</label>
              <input type="number" className="input-field" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Diện tích (m²) *</label>
              <input type="number" step="0.1" className="input-field" required value={form.areaSqm} onChange={e => setForm({ ...form, areaSqm: e.target.value })} placeholder="25" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Giá thuê/tháng (VNĐ) *</label>
              <input type="number" className="input-field" required value={form.priceMonthly} onChange={e => setForm({ ...form, priceMonthly: e.target.value })} placeholder="3500000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Đặt cọc (VNĐ)</label>
              <input type="number" className="input-field" value={form.deposit} onChange={e => setForm({ ...form, deposit: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tiện ích (phẩy cách)</label>
              <input className="input-field" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="Điều hoà, Nóng lạnh, WC riêng" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả</label>
              <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Thêm phòng</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Huỷ</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50/80">
              <tr>
                <th className="table-header">Phòng</th>
                <th className="table-header">Tòa nhà</th>
                <th className="table-header">Diện tích</th>
                <th className="table-header">Giá thuê</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header">Duyệt</th>
                <th className="table-header">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rooms.map((r: any) => (
                <tr key={r.id} className="hover:bg-stone-50/50">
                  <td className="table-cell font-medium">{r.roomNumber} <span className="text-stone-400 font-normal">• T{r.floor}</span></td>
                  <td className="table-cell">{r.property?.name}</td>
                  <td className="table-cell">{r.areaSqm}m²</td>
                  <td className="table-cell font-medium text-brand-600">{formatCurrency(r.priceMonthly)}</td>
                  <td className="table-cell">
                    <button onClick={() => toggleAvailability(r.id, r.isAvailable)}
                      className={`badge cursor-pointer ${r.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      {r.isAvailable ? '🟢 Còn trống' : '🔴 Đã thuê'}
                    </button>
                  </td>
                  <td className="table-cell">
                    <button onClick={() => toggleApproval(r.id, r.isApproved)}
                      className={`badge cursor-pointer ${r.isApproved ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.isApproved ? '✓ Đã duyệt' : 'Chờ duyệt'}
                    </button>
                  </td>
                  <td className="table-cell">
                    <button onClick={async () => {
                      if (confirm('Xoá phòng này?')) {
                        await fetch(`/api/rooms?id=${r.id}`, { method: 'DELETE' });
                        toast.success('Đã xoá'); fetchData();
                      }
                    }} className="text-xs text-red-500 hover:underline">Xoá</button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr><td colSpan={7} className="table-cell text-center text-stone-400 py-12">Chưa có phòng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
