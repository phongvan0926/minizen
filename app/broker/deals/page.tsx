'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function BrokerDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    roomId: '', dealPrice: '', commissionTotal: '', customerName: '', customerPhone: '', notes: '',
  });

  const fetchData = async () => {
    const [dealsRes, roomsRes] = await Promise.all([
      fetch('/api/deals'), fetch('/api/rooms?available=true'),
    ]);
    setDeals(await dealsRes.json());
    setRooms(await roomsRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Đã gửi deal! Chờ Admin xác nhận.');
      setShowForm(false);
      setForm({ roomId: '', dealPrice: '', commissionTotal: '', customerName: '', customerPhone: '', notes: '' });
      fetchData();
    }
  };

  if (loading) return <div className="animate-pulse text-stone-400 p-8">Đang tải...</div>;

  const myCommission = deals
    .filter(d => d.status === 'CONFIRMED' || d.status === 'PAID')
    .reduce((s, d) => s + d.commissionBroker, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Giao dịch của tôi</h1>
          <p className="text-sm text-stone-500 mt-1">Tổng hoa hồng: <span className="font-bold text-brand-600">{formatCurrency(myCommission)}</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Đóng' : '+ Báo deal mới'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Báo deal thành công</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Phòng *</label>
              <select className="input-field" required value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
                <option value="">Chọn phòng</option>
                {rooms.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.roomNumber} - {r.property?.name} ({formatCurrency(r.priceMonthly)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Giá deal (VNĐ) *</label>
              <input type="number" className="input-field" required value={form.dealPrice}
                onChange={e => setForm({ ...form, dealPrice: e.target.value })} placeholder="3500000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Hoa hồng tổng (VNĐ)</label>
              <input type="number" className="input-field" value={form.commissionTotal}
                onChange={e => setForm({ ...form, commissionTotal: e.target.value })} placeholder="Để trống = 50% giá deal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tên khách</label>
              <input className="input-field" value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Nguyễn Văn B" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">SĐT khách</label>
              <input className="input-field" value={form.customerPhone}
                onChange={e => setForm({ ...form, customerPhone: e.target.value })} placeholder="0912345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Ghi chú</label>
              <input className="input-field" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Ghi chú thêm..." />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Gửi deal</button>
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
                <th className="table-header">Khách</th>
                <th className="table-header">Giá deal</th>
                <th className="table-header">HH của tôi</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {deals.map((d: any) => (
                <tr key={d.id} className="hover:bg-stone-50/50">
                  <td className="table-cell">
                    <p className="font-medium">{d.room?.roomNumber}</p>
                    <p className="text-xs text-stone-500">{d.room?.property?.name}</p>
                  </td>
                  <td className="table-cell">
                    <p>{d.customerName || '—'}</p>
                    <p className="text-xs text-stone-500">{d.customerPhone || ''}</p>
                  </td>
                  <td className="table-cell font-medium">{formatCurrency(d.dealPrice)}</td>
                  <td className="table-cell font-bold text-brand-600">{formatCurrency(d.commissionBroker)}</td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(d.status)}`}>{getStatusLabel(d.status)}</span>
                  </td>
                  <td className="table-cell text-xs text-stone-500">{formatDate(d.dealDate)}</td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr><td colSpan={6} className="table-cell text-center text-stone-400 py-12">Chưa có giao dịch nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
