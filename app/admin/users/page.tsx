'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatDate, getRoleLabel, getRoleColor } from '@/lib/utils';

const ROLE_AVATAR_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-500',
  BROKER: 'bg-orange-500',
  LANDLORD: 'bg-amber-500',
  CUSTOMER: 'bg-blue-500',
};

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

  const getInitials = (name: string) => {
    return name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '?';
  };

  const roleCounts: Record<string, number> = {};
  users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl font-bold">Quản lý người dùng</h1>
        <span className="text-sm text-stone-500">{users.length} người dùng</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'ADMIN', 'BROKER', 'LANDLORD', 'CUSTOMER'].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              filter === r ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}>
            {r === '' ? 'Tất cả' : getRoleLabel(r)}
            {r === '' && <span className="ml-1.5 text-stone-400">({users.length})</span>}
          </button>
        ))}
      </div>

      {/* Users as cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u: any) => (
          <div key={u.id} className="card hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl ${ROLE_AVATAR_COLORS[u.role] || 'bg-stone-400'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                  {getInitials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-stone-900 truncate">{u.name}</h3>
                    <span className={`badge text-[10px] ${getRoleColor(u.role)}`}>{getRoleLabel(u.role)}</span>
                  </div>
                  <p className="text-sm text-stone-500 truncate">{u.email}</p>
                  {u.phone && (
                    <p className="text-sm text-stone-400 mt-0.5">{u.phone}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                <span className="text-xs text-stone-400">
                  Ngày tạo: {formatDate(u.createdAt)}
                </span>
                <button onClick={() => toggleActive(u.id, u.isActive)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    u.isActive
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="col-span-full text-center text-stone-400 py-12">
            Không có người dùng nào
          </div>
        )}
      </div>
    </div>
  );
}
