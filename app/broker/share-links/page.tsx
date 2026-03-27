'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

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

  if (loading) return <div className="animate-pulse text-stone-400 p-8">Đang tải...</div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2">Link chia sẻ</h1>
      <p className="text-sm text-stone-500 mb-6">Quản lý các link đã gửi cho khách</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs font-medium text-stone-500 uppercase">Tổng link</p>
          <p className="text-xl font-bold mt-1">{links.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-stone-500 uppercase">Tổng lượt xem</p>
          <p className="text-xl font-bold mt-1 text-brand-600">{links.reduce((s: number, l: any) => s + l.viewCount, 0)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-stone-500 uppercase">Link active</p>
          <p className="text-xl font-bold mt-1 text-emerald-600">{links.filter((l: any) => l.isActive).length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {links.map((link: any) => (
          <div key={link.id} className="card-hover flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <p className="font-medium text-stone-900">
                {link.room?.roomNumber} — {link.room?.property?.name}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {link.room?.property?.district} • Tạo: {formatDate(link.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-brand-600">{link.viewCount}</p>
                <p className="text-xs text-stone-500">lượt xem</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyLink(link.token)} className="btn-ghost text-xs">
                  📋 Copy link
                </button>
                <a href={`/share/${link.token}`} target="_blank" className="btn-ghost text-xs">
                  👁️ Xem
                </a>
                <button onClick={() => deleteLink(link.id)} className="btn-ghost text-xs text-red-500">
                  🗑️ Xoá
                </button>
              </div>
            </div>
          </div>
        ))}
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
