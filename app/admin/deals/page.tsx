'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch('/api/deals');
    setDeals(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/deals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    toast.success(`Đã ${status === 'CONFIRMED' ? 'xác nhận' : status === 'PAID' ? 'thanh toán' : 'huỷ'} giao dịch`);
    fetchData();
  };

  if (loading) return <div className="animate-pulse text-stone-400 p-8">Đang tải...</div>;

  const totalCommission = deals.filter(d => d.status === 'CONFIRMED' || d.status === 'PAID').reduce((s, d) => s + d.commissionTotal, 0);
  const companyCommission = deals.filter(d => d.status === 'CONFIRMED' || d.status === 'PAID').reduce((s, d) => s + d.commissionCompany, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2">Giao dịch & Hoa hồng</h1>
      <p className="text-sm text-stone-500 mb-6">{deals.length} giao dịch</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Tổng deal</p>
          <p className="text-xl font-bold mt-1">{deals.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Đã xác nhận</p>
          <p className="text-xl font-bold mt-1 text-emerald-600">{deals.filter(d => d.status === 'CONFIRMED' || d.status === 'PAID').length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Tổng HH</p>
          <p className="text-xl font-bold mt-1 text-brand-600">{formatCurrency(totalCommission)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">HH Công ty</p>
          <p className="text-xl font-bold mt-1 text-purple-600">{formatCurrency(companyCommission)}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50/80">
              <tr>
                <th className="table-header">Phòng</th>
                <th className="table-header">Môi giới</th>
                <th className="table-header">Khách</th>
                <th className="table-header">Giá deal</th>
                <th className="table-header">HH Tổng</th>
                <th className="table-header">HH MG / CT</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header">Ngày</th>
                <th className="table-header">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {deals.map((d: any) => (
                <tr key={d.id} className="hover:bg-stone-50/50">
                  <td className="table-cell">
                    <p className="font-medium">{d.room?.roomNumber}</p>
                    <p className="text-xs text-stone-500">{d.room?.property?.name}</p>
                  </td>
                  <td className="table-cell">{d.broker?.name}</td>
                  <td className="table-cell">
                    <p>{d.customerName || d.customer?.name || '—'}</p>
                    <p className="text-xs text-stone-500">{d.customerPhone || d.customer?.phone || ''}</p>
                  </td>
                  <td className="table-cell font-medium">{formatCurrency(d.dealPrice)}</td>
                  <td className="table-cell font-medium text-brand-600">{formatCurrency(d.commissionTotal)}</td>
                  <td className="table-cell text-xs">
                    <span className="text-orange-600">{formatCurrency(d.commissionBroker)}</span>
                    {' / '}
                    <span className="text-purple-600">{formatCurrency(d.commissionCompany)}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(d.status)}`}>{getStatusLabel(d.status)}</span>
                  </td>
                  <td className="table-cell text-xs text-stone-500">{formatDate(d.dealDate)}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      {d.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus(d.id, 'CONFIRMED')} className="text-xs text-emerald-600 hover:underline">Xác nhận</button>
                          <button onClick={() => updateStatus(d.id, 'CANCELLED')} className="text-xs text-red-500 hover:underline">Huỷ</button>
                        </>
                      )}
                      {d.status === 'CONFIRMED' && (
                        <button onClick={() => updateStatus(d.id, 'PAID')} className="text-xs text-brand-600 hover:underline">Đã trả HH</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr><td colSpan={9} className="table-cell text-center text-stone-400 py-12">Chưa có giao dịch</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
