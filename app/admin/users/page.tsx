'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatDate, getRoleLabel, getRoleColor } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch(`/api/users${filter ? `?role=${filter}` : ''}`);
    setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const toggleActive = async (id: string, current: boolean) => {
    await fetch('/api/users', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !current }),
    });
    toast.success(!current ? 'Đã kích hoạt' : 'Đã vô hiệu hoá');
    fetchData();
  };

  if (loading) return <div className="animate-pulse text-stone-400 p-8">Đang tải...</div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2">Quản lý người dùng</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'ADMIN', 'BROKER', 'LANDLORD', 'CUSTOMER'].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              filter === r ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}>
            {r === '' ? 'Tất cả' : getRoleLabel(r)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50/80">
              <tr>
                <th className="table-header">Họ tên</th>
                <th className="table-header">Email</th>
                <th className="table-header">SĐT</th>
                <th className="table-header">Vai trò</th>
                <th className="table-header">Ngày tạo</th>
                <th className="table-header">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-stone-50/50">
                  <td className="table-cell font-medium">{u.name}</td>
                  <td className="table-cell text-stone-500">{u.email}</td>
                  <td className="table-cell">{u.phone || '—'}</td>
                  <td className="table-cell"><span className={`badge ${getRoleColor(u.role)}`}>{getRoleLabel(u.role)}</span></td>
                  <td className="table-cell text-xs text-stone-500">{formatDate(u.createdAt)}</td>
                  <td className="table-cell">
                    <button onClick={() => toggleActive(u.id, u.isActive)}
                      className={`badge cursor-pointer ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
