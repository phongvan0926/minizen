'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import RoomForm from '@/components/forms/RoomForm';

const ROOM_TYPE_LABELS: Record<string, string> = {
  don: 'Phòng đơn', gac_xep: 'Gác xép', '1k1n': '1K1N',
  '2k1n': '2K1N', studio: 'Studio', duplex: 'Duplex',
};

export default function LandlordRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showInquiries, setShowInquiries] = useState(false);

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

  const openCreate = () => {
    setEditingRoom(null);
    setShowModal(true);
  };

  const openEdit = (room: any) => {
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleFormSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingRoom) {
        const res = await fetch('/api/rooms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingRoom.id, ...data }),
        });
        if (res.ok) {
          toast.success('Đã cập nhật phòng!');
          setShowModal(false);
          fetchData();
        } else {
          toast.error('Lỗi cập nhật');
        }
      } else {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          toast.success('Đã thêm phòng! Chờ Admin duyệt.');
          setShowModal(false);
          fetchData();
        } else {
          toast.error('Lỗi thêm phòng');
        }
      }
    } finally {
      setSubmitting(false);
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
              Hỏi phòng
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {pendingInquiries.length}
              </span>
            </button>
          )}
          <button onClick={openCreate} className="btn-primary">
            + Thêm phòng
          </button>
        </div>
      </div>

      {/* Inquiry notifications */}
      {showInquiries && pendingInquiries.length > 0 && (
        <div className="card mb-6 border-amber-200 bg-amber-50/50">
          <h2 className="font-display font-semibold text-lg mb-3">Môi giới đang hỏi</h2>
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
                    CÒN PHÒNG
                  </button>
                  <button onClick={() => replyInquiry(inq.id, 'HẾT')}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all">
                    HẾT PHÒNG
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {rooms.map((room: any) => {
          const commission = room.commissionJson ? (typeof room.commissionJson === 'string' ? JSON.parse(room.commissionJson) : room.commissionJson) : {};
          const roomInq = inquiries.filter((i: any) => i.roomId === room.id && !i.reply);
          const coverImage = room.images && room.images.length > 0 ? room.images[0] : null;

          return (
            <div key={room.id} className="card-hover overflow-hidden relative group">
              {roomInq.length > 0 && (
                <span className="absolute top-2 left-2 z-10 w-6 h-6 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                  {roomInq.length}
                </span>
              )}

              {/* Cover image */}
              <div className="relative -mx-5 -mt-5 mb-4 h-40 overflow-hidden">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={`P.${room.roomNumber}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                    <span className="text-4xl opacity-50">🚪</span>
                  </div>
                )}
                {room.images && room.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                    +{room.images.length - 1} ảnh
                  </div>
                )}
                {!room.isApproved && (
                  <div className="absolute top-2 right-2">
                    <span className="badge bg-amber-100 text-amber-700">Chờ duyệt</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-display font-semibold text-lg">P.{room.roomNumber}</h3>
                  <p className="text-sm text-stone-500">{room.property?.name} • T{room.floor} • {room.areaSqm}m²</p>
                </div>
                <span className="badge bg-stone-100 text-stone-600 text-[10px]">
                  {ROOM_TYPE_LABELS[room.roomType] || room.roomType}
                </span>
              </div>

              <p className="text-lg font-bold text-brand-600 mb-2">
                {formatCurrency(room.priceMonthly)}
                <span className="text-sm font-normal text-stone-400">/tháng</span>
              </p>

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
                  {room.amenities.slice(0, 5).map((a: string) => (
                    <span key={a} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">{a}</span>
                  ))}
                  {room.amenities.length > 5 && (
                    <span className="text-[10px] text-stone-400">+{room.amenities.length - 5}</span>
                  )}
                </div>
              )}

              {/* Pending inquiries inline */}
              {roomInq.length > 0 && (
                <div className="p-2 bg-amber-50 rounded-lg mb-2 border border-amber-100">
                  {roomInq.map((inq: any) => (
                    <div key={inq.id} className="flex items-center justify-between gap-2 mb-1 last:mb-0">
                      <p className="text-xs text-amber-800 truncate">{inq.broker?.name}: {inq.message}</p>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => replyInquiry(inq.id, 'CÒN')} className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded hover:bg-emerald-200">CÒN</button>
                        <button onClick={() => replyInquiry(inq.id, 'HẾT')} className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded hover:bg-red-200">HẾT</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <button
                  onClick={() => openEdit(room)}
                  className="w-full py-2 rounded-xl text-sm font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-all border border-brand-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Chỉnh sửa
                </button>
                <button onClick={() => toggleAvailability(room.id, room.isAvailable)}
                  className={'w-full py-2 rounded-xl text-sm font-medium transition-all ' +
                    (room.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200')}>
                  {room.isAvailable ? 'Trống — Bấm tắt' : 'Đã thuê — Bấm mở'}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4 z-10">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-20">
              <h2 className="font-display text-lg font-bold text-stone-900">
                {editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <RoomForm
                initialData={editingRoom || undefined}
                properties={properties.map((p: any) => ({ id: p.id, name: p.name, district: p.district }))}
                onSubmit={handleFormSubmit}
                isAdmin={false}
                loading={submitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
