'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const roomTypeLabels: Record<string, string> = {
  don: 'Phòng đơn', gac_xep: 'Gác xép', '1k1n': '1 khách 1 ngủ',
  '2k1n': '2 khách 1 ngủ', studio: 'Studio', duplex: 'Duplex',
};

export default function ShareViewPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/share-links?token=${token}`)
      .then(res => { if (!res.ok) throw new Error('not found'); return res.json(); })
      .then(setData)
      .catch(() => setError('Link không tồn tại hoặc đã hết hạn'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="animate-pulse text-stone-400">Đang tải thông tin phòng...</div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="text-center">
        <p className="text-5xl mb-4">😔</p>
        <h1 className="font-display text-2xl font-bold mb-2">Không tìm thấy</h1>
        <p className="text-stone-500 mb-6">{error || 'Link không hợp lệ'}</p>
        <Link href="/" className="btn-primary">Về trang chủ</Link>
      </div>
    </div>
  );

  const room = data.room;
  const property = room?.property;

  // Build Google Maps direction URL using district + street (no exact address)
  const mapsQuery = encodeURIComponent(`${property?.streetName}, ${property?.district}, ${property?.city || 'Hà Nội'}`);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-display font-semibold">MiniZen</span>
          </div>
          <span className="text-xs text-stone-400">Chia sẻ bởi {data.broker?.name}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Room hero */}
        <div className="h-56 md:h-72 bg-gradient-to-br from-brand-100 via-brand-50 to-blue-50 rounded-2xl mb-6 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl">🏢</span>
            <p className="text-sm text-stone-400 mt-2">{property?.name}</p>
          </div>
        </div>

        {/* Room info */}
        <div className="card mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-display text-2xl font-bold">{property?.name}</h1>
              <p className="text-stone-500 mt-1">Phòng {room.roomNumber} • Tầng {room.floor}</p>
            </div>
            <span className="badge bg-emerald-100 text-emerald-700 text-sm py-1">Còn trống</span>
          </div>

          {room.roomType && room.roomType !== 'don' && (
            <span className="badge bg-brand-100 text-brand-700 mb-3">{roomTypeLabels[room.roomType] || room.roomType}</span>
          )}

          <div className="text-3xl font-bold text-brand-600 mb-4">
            {formatCurrency(room.priceMonthly)}
            <span className="text-base font-normal text-stone-400">/tháng</span>
          </div>

          {room.deposit > 0 && (
            <p className="text-sm text-stone-500 mb-4">Đặt cọc: {formatCurrency(room.deposit)}</p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-stone-50 rounded-xl">
              <p className="text-xs text-stone-500">Diện tích</p>
              <p className="font-semibold">{room.areaSqm} m²</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl">
              <p className="text-xs text-stone-500">Tầng</p>
              <p className="font-semibold">Tầng {room.floor}</p>
            </div>
          </div>

          {room.description && (
            <p className="text-sm text-stone-600 leading-relaxed mb-4">{room.description}</p>
          )}

          {room.amenities?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Tiện ích phòng</p>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((a: string) => (
                  <span key={a} className="px-3 py-1.5 bg-brand-50 text-brand-700 text-sm rounded-lg border border-brand-100">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Building features */}
        <div className="card mb-4">
          <h2 className="font-display font-semibold text-lg mb-3">🏢 Tiện ích tòa nhà</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {property?.amenities?.map((a: string) => (
              <span key={a} className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm rounded-lg">{a}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {property?.parkingCar && <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg">🚗 Ô tô đỗ cửa</span>}
            {property?.evCharging && <span className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg">⚡ Sạc xe điện</span>}
            {property?.petAllowed && <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg">🐾 Nuôi thú cưng</span>}
            {property?.foreignerOk && <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-lg">🌍 Cho người nước ngoài</span>}
          </div>
        </div>

        {/* Location with DIRECTIONS button */}
        <div className="card mb-4">
          <h2 className="font-display font-semibold text-lg mb-3">📍 Vị trí</h2>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="font-medium text-stone-900">Khu vực: {property?.district}, {property?.city}</p>
            <p className="text-sm text-stone-500 mt-1">Tuyến phố: {property?.streetName}</p>
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-700">🔒 Địa chỉ chi tiết sẽ được cung cấp khi hẹn xem phòng qua môi giới</p>
            </div>
          </div>

          {/* Google Maps direction button */}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 rounded-xl text-sm transition-all border border-blue-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Chỉ đường đến khu vực này (Google Maps)
          </a>
        </div>

        {/* Contact CTA */}
        <div className="card bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
          <h2 className="font-display font-semibold text-lg mb-2">Quan tâm phòng này?</h2>
          <p className="text-brand-100 text-sm mb-4">Liên hệ môi giới để được tư vấn và hẹn xem phòng miễn phí.</p>
          <div className="flex gap-3">
            <a href={`tel:+84`} className="flex-1 bg-white text-brand-700 font-medium py-3 rounded-xl text-center text-sm hover:bg-brand-50 transition-all">
              📞 Gọi môi giới
            </a>
            <a href={`sms:+84`} className="flex-1 bg-white/20 text-white font-medium py-3 rounded-xl text-center text-sm hover:bg-white/30 transition-all border border-white/20">
              💬 Nhắn tin
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-8 mb-4">
          Powered by MiniZen • Link chia sẻ bởi {data.broker?.name}
        </p>
      </div>
    </div>
  );
}
