'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function BrokerShareLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch('/api/share-links');
    setLinks(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    toast.success('Đã copy link!');
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Xoá link này?')) return;
    await fetch(`/api/share-links?id=${id}`, { method: 'DELETE' });
    toast.success('Đã xoá');
    fetchData();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
    </div>
  );

  const totalViews = links.reduce((s: number, l: any) => s + l.viewCount, 0);
  const activeLinks = links.filter((l: any) => l.isActive).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2">Link chia sẻ</h1>
      <p className="text-sm text-stone-500 mb-6">Quản lý các link đã gửi cho khách</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔗</span>
            <p className="text-xs font-medium text-stone-500 uppercase">Tổng link</p>
          </div>
          <p className="text-xl font-bold mt-1">{links.length}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <span className="text-lg">👁️</span>
            <p className="text-xs font-medium text-stone-500 uppercase">Tổng lượt xem</p>
          </div>
          <p className="text-xl font-bold mt-1 text-brand-600">{totalViews}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <p className="text-xs font-medium text-stone-500 uppercase">Link active</p>
          </div>
          <p className="text-xl font-bold mt-1 text-emerald-600">{activeLinks}</p>
        </div>
      </div>

      <div className="space-y-3">
        {links.map((link: any) => {
          const roomImages: string[] = link.room?.images || [];
          const propImages: string[] = link.room?.property?.images || [];
          const coverImage = roomImages[0] || propImages[0];

          return (
            <div key={link.id} className="card-hover">
              <div className="flex gap-4 items-center flex-wrap">
                {/* Room image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-100 to-brand-50">
                  {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🏢</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-[180px]">
                  <p className="font-semibold text-stone-900">
                    P.{link.room?.roomNumber} — {link.room?.property?.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-stone-500">{link.room?.property?.district}</span>
                    {link.room?.priceMonthly && (
                      <span className="text-xs font-semibold text-brand-600">{formatCurrency(link.room.priceMonthly)}</span>
                    )}
                    <span className="text-xs text-stone-400">Tạo: {formatDate(link.createdAt)}</span>
                  </div>
                </div>

                {/* View count */}
                <div className="text-center flex-shrink-0">
                  <p className="text-2xl font-bold text-brand-600">{link.viewCount}</p>
                  <p className="text-[10px] text-stone-500 uppercase font-medium">lượt xem</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => copyLink(link.token)}
                    className="px-3 py-2 bg-brand-50 text-brand-700 rounded-lg text-xs font-medium hover:bg-brand-100 transition-colors">
                    📋 Copy
                  </button>
                  <a href={`/share/${link.token}`} target="_blank"
                    className="px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-200 transition-colors">
                    👁️ Xem
                  </a>
                  <button onClick={() => deleteLink(link.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {links.length === 0 && (
          <div className="text-center py-16 text-stone-400 card">
            <p className="text-4xl mb-3">🔗</p>
            <p>Chưa có link nào. Vào <strong>Kho hàng</strong> để tạo link.</p>
          </div>
        )}
      </div>
    </div>
  );
}
