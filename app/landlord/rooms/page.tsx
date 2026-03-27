'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const roomTypeOptions = [
  { value: 'don', label: 'Phòng đơn' }, { value: 'gac_xep', label: 'Gác xép' },
  { value: '1k1n', label: '1 khách 1 ngủ' }, { value: '2k1n', label: '2 khách 1 ngủ' },
  { value: 'studio', label: 'Studio' }, { value: 'duplex', label: 'Duplex' },
];

export default function LandlordRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showInquiries, setShowInquiries] = useState(false);
  const [form, setForm] = useState({
    propertyId: '', roomNumber: '', floor: '1', areaSqm: '', priceMonthly: '', deposit: '0',
    description: '', amenities: '', roomType: 'don', landlordNotes: '',
    commission6: '', commission12: '',
  });

  const fetchData = async () => {
    const [roomsRes, propsRes, inqRes] = await Promise.all([
      fetch('/api/rooms'), fetch('/api/properties'),
      fetch('/api/inquiries').catch(() => ({ json: () => [] })),
    ]);
    setRooms(await roomsRes.json());
    setProperties(await propsRes.json());
    try { setInquiries(await inqRes.json()); } catch { setInquiries([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const commissionJson: Record<string, number> = {};
    if (form.commission6) commissionJson['6'] = parseInt(form.commission6);
    if (form.commission12) commissionJson['12'] = parseInt(form.commission12);

    const res = await fetch('/api/rooms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean),
        commissionJson: Object.keys(commissionJson).length > 0 ? JSON.stringify(commissionJson) : null,
      }),
    });
    if (res.ok) {
      toast.success('Đã thêm phòng! Chờ Admin duyệt.');
      setShowForm(false);
      setForm({ propertyId: '', roomNumber: '', floor: '1', areaSqm: '', priceMonthly: '', deposit: '0',
        description: '', amenities: '', roomType: 'don', landlordNotes: '', commission6: '', commission12: '' });
      fetchData();
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await fetch('/api/rooms', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isAvailable: !current }),
    });
    toast.success(!current ? 'Đã mở phòng trống' : 'Đã đánh dấu đã thuê');
    fetchData();
  };

  const replyInquiry = async (inqId: string, reply: string) => {
    await fetch('/api/inquiries', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: inqId, reply }),
    });
    toast.success('Đã phản hồi!');
    fetchData();
  };

  const set = (key: string, val: any) => setForm({ ...form, [key]: val });

  if (loading) return <div className="animate-pulse text-stone-400 p-8">Đang tải...</div>;

  const pendingInquiries = inquiries.filter((i: any) => !i.reply);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Phòng của tôi</h1>
          <p className="text-sm text-stone-500 mt-1">
            <span className="text-emerald-600 font-medium">{rooms.filter(r => r.isAvailable).length} trống</span> / {rooms.length} phòng
          </p>
        </div>
        <div className="flex gap-2">
          {pendingInquiries.length > 0 && (
            <button onClick={() => setShowInquiries(!showInquiries)}
              className="btn-secondary relative">
              🔔 Hỏi phòng
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {pendingInquiries.length}
              </span>
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Đóng' : '+ Thêm phòng'}
          </button>
        </div>
      </div>

      {/* Inquiry notifications */}
      {showInquiries && pendingInquiries.length > 0 && (
        <div className="card mb-6 border-amber-200 bg-amber-50/50">
          <h2 className="font-display font-semibold text-lg mb-3">🔔 Môi giới đang hỏi</h2>
          <div className="space-y-3">
            {pendingInquiries.map((inq: any) => (
              <div key={inq.id} className="bg-white rounded-xl p-4 border border-amber-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{inq.broker?.name} hỏi phòng <strong>{inq.room?.roomNumber}</strong></p>
                    <p className="text-xs text-stone-500">{inq.message} • {formatDateTime(inq.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => replyInquiry(inq.id, 'CÒN')}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-all">
                    ✅ CÒN PHÒNG
                  </button>
                  <button onClick={() => replyInquiry(inq.id, 'HẾT')}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all">
                    ❌ HẾT PHÒNG
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add room form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Thêm phòng mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tòa nhà *</label>
                <select className="input-field" required value={form.propertyId} onChange={e => set('propertyId', e.target.value)}>
                  <option value="">Chọn tòa nhà</option>
                  {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Loại phòng *</label>
                <select className="input-field" value={form.roomType} onChange={e => set('roomType', e.target.value)}>
                  {roomTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Số phòng *</label>
                <input className="input-field" required value={form.roomNumber} onChange={e => set('roomNumber', e.target.value)} placeholder="P201" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tầng</label>
                <input type="number" className="input-field" value={form.floor} onChange={e => set('floor', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Diện tích (m²) *</label>
                <input type="number" step="0.1" className="input-field" required value={form.areaSqm} onChange={e => set('areaSqm', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Giá thuê/tháng *</label>
                <input type="number" className="input-field" required value={form.priceMonthly} onChange={e => set('priceMonthly', e.target.value)} placeholder="3500000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Đặt cọc</label>
                <input type="number" className="input-field" value={form.deposit} onChange={e => set('deposit', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tiện ích (phẩy cách)</label>
                <input className="input-field" value={form.amenities} onChange={e => set('amenities', e.target.value)} placeholder="Điều hoà, Nóng lạnh, WC riêng" />
              </div>
            </div>

            {/* Commission settings */}
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">💰 Hoa hồng cho môi giới</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Khách thuê 6 tháng (%)</label>
                  <input type="number" min="0" max="100" className="input-field" value={form.commission6}
                    onChange={e => set('commission6', e.target.value)} placeholder="40" />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Khách thuê 12 tháng (%)</label>
                  <input type="number" min="0" max="100" className="input-field" value={form.commission12}
                    onChange={e => set('commission12', e.target.value)} placeholder="50" />
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-1">% tính trên 1 tháng tiền thuê. VD: 40% của 3.5tr = 1.4tr</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">📝 Lưu ý cho môi giới</label>
              <textarea className="input-field" rows={2} value={form.landlordNotes} onChange={e => set('landlordNotes', e.target.value)}
                placeholder="VD: Khách phải đặt cọc 2 tháng, ưu tiên ở lâu dài..." />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Thêm phòng</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Huỷ</button>
            </div>
          </form>
        </div>
      )}

      {/* Room cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map((room: any) => {
          const commission = room.commissionJson ? JSON.parse(room.commissionJson) : {};
          const roomInq = inquiries.filter((i: any) => i.roomId === room.id && !i.reply);

          return (
            <div key={room.id} className="card-hover relative">
              {roomInq.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                  {roomInq.length}
                </span>
              )}

              <div className="h-28 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl mb-3 flex items-center justify-center">
                <span className="text-2xl">🚪</span>
              </div>

              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">P.{room.roomNumber}</h3>
                  <p className="text-sm text-stone-500">{room.property?.name} • T{room.floor} • {room.areaSqm}m²</p>
                </div>
                {!room.isApproved && <span className="badge bg-amber-100 text-amber-700">Chờ duyệt</span>}
              </div>

              <p className="text-lg font-bold text-brand-600 mb-2">{formatCurrency(room.priceMonthly)}<span className="text-sm font-normal text-stone-400">/tháng</span></p>

              {/* Commission display */}
              {Object.keys(commission).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {Object.entries(commission).map(([m, p]) => (
                    <span key={m} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      HH {m}th: {String(p)}%
                    </span>
                  ))}
                </div>
              )}

              {room.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {room.amenities.map((a: string) => (
                    <span key={a} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">{a}</span>
                  ))}
                </div>
              )}

              {/* Pending inquiries inline */}
              {roomInq.length > 0 && (
                <div className="p-2 bg-amber-50 rounded-lg mb-2 border border-amber-100">
                  {roomInq.map((inq: any) => (
                    <div key={inq.id} className="flex items-center justify-between gap-2 mb-1 last:mb-0">
                      <p className="text-xs text-amber-800">{inq.broker?.name}: {inq.message}</p>
                      <div className="flex gap-1">
                        <button onClick={() => replyInquiry(inq.id, 'CÒN')} className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded hover:bg-emerald-200">CÒN</button>
                        <button onClick={() => replyInquiry(inq.id, 'HẾT')} className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded hover:bg-red-200">HẾT</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-stone-100">
                <button onClick={() => toggleAvailability(room.id, room.isAvailable)}
                  className={'w-full py-2 rounded-xl text-sm font-medium transition-all ' +
                    (room.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200')}>
                  {room.isAvailable ? '🟢 Trống — Bấm tắt' : '🔴 Đã thuê — Bấm mở'}
                </button>
              </div>
            </div>
          );
        })}
        {rooms.length === 0 && (
          <div className="md:col-span-3 text-center py-16 text-stone-400 card">
            <p className="text-4xl mb-3">🚪</p><p>Nhấn <strong>+ Thêm phòng</strong> để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
