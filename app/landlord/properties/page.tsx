'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import PropertyForm from '@/components/forms/PropertyForm';

export default function LandlordPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const [propsRes, statsRes] = await Promise.all([
      fetch('/api/properties'), fetch('/api/dashboard-stats'),
    ]);
    setProperties(await propsRes.json());
    setStats(await statsRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingProperty(null);
    setShowModal(true);
  };

  const openEdit = (property: any) => {
    setEditingProperty(property);
    setShowModal(true);
  };

  const handleFormSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingProperty) {
        const res = await fetch('/api/properties', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProperty.id, ...data }),
        });
        if (res.ok) {
          toast.success('Đã cập nhật tòa nhà!');
          setShowModal(false);
          fetchData();
        } else {
          toast.error('Lỗi cập nhật');
        }
      } else {
        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          toast.success('Đã gửi! Chờ Admin duyệt.');
          setShowModal(false);
          fetchData();
        } else {
          toast.error('Lỗi thêm tòa nhà');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse text-stone-400 p-8">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Tòa nhà của tôi</h1>
          <p className="text-sm text-stone-500 mt-1">{properties.length} tòa nhà</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Thêm tòa nhà
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

      {/* Property cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {properties.map((p: any) => (
          <div key={p.id} className="card-hover overflow-hidden group">
            {/* Cover image */}
            <div className="relative -mx-5 -mt-5 mb-4 h-44 overflow-hidden">
              {p.images && p.images.length > 0 ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                  <span className="text-5xl opacity-50">🏢</span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={'badge ' + getStatusColor(p.status)}>{getStatusLabel(p.status)}</span>
              </div>
              {p.images && p.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                  +{p.images.length - 1} ảnh
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mb-3">
              <h3 className="font-display font-semibold text-lg text-stone-900">{p.name}</h3>
              <p className="text-sm text-stone-500 mt-0.5">{p.fullAddress}</p>
              <p className="text-sm text-stone-400">{p.district} • {p.totalFloors} tầng</p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 mb-3 text-sm">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                {p.rooms?.filter((r: any) => r.isAvailable).length} trống
              </span>
              <span className="text-stone-400">/</span>
              <span className="text-stone-600">{p.rooms?.length} phòng</span>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {p.zaloPhone && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                  Zalo: {p.zaloPhone}
                </span>
              )}
              {p.parkingCar && <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">🚗 Ô tô</span>}
              {p.evCharging && <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">⚡ Sạc EV</span>}
              {p.petAllowed && <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">🐾 Thú cưng</span>}
              {p.foreignerOk && <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">🌍 Nước ngoài</span>}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-100">
              <button
                onClick={() => openEdit(p)}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-all border border-brand-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            </div>
          </div>
        ))}
        {properties.length === 0 && (
          <div className="md:col-span-3 text-center py-16 text-stone-400 card">
            <p className="text-4xl mb-3">🏠</p><p>Nhấn <strong>+ Thêm tòa nhà</strong> để bắt đầu.</p>
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
                {editingProperty ? 'Sửa tòa nhà' : 'Đăng tòa nhà mới'}
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
              <PropertyForm
                initialData={editingProperty || undefined}
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
