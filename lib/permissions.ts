/**
 * Client-safe permission helpers + constants.
 * KHÔNG import next/server ở đây — file này dùng được cả client & server.
 * API guard (requirePermission) nằm ở lib/permissions-server.ts.
 */

export type AdminPermission =
  | 'TRANSFER_PROPERTY_OWNERSHIP'
  | 'DELETE_PROPERTY'
  | 'EDIT_COMMISSION'
  | 'APPROVE_LISTINGS'
  | 'MANAGE_USERS'
  | 'VIEW_FINANCIAL_REPORTS'
  | 'EXPORT_DATA'
  | 'MANAGE_COMPANIES'
  | 'MANAGE_SYSTEM_SHARE_LINKS';

export const ALL_ADMIN_PERMISSIONS: { value: AdminPermission; label: string; desc: string }[] = [
  { value: 'TRANSFER_PROPERTY_OWNERSHIP', label: 'Chuyển sở hữu tòa nhà', desc: 'Đổi chủ nhà của 1 tòa nhà (kéo theo toàn bộ tin đăng, deal, link share)' },
  { value: 'DELETE_PROPERTY',             label: 'Xóa tòa nhà',          desc: 'Xóa vĩnh viễn tòa nhà khỏi hệ thống' },
  { value: 'EDIT_COMMISSION',             label: 'Sửa hoa hồng',          desc: 'Thay đổi commissionJson của tin đăng + setting commission_broker_percent' },
  { value: 'APPROVE_LISTINGS',            label: 'Duyệt tin đăng',        desc: 'Duyệt/từ chối Property (status) và RoomType (isApproved)' },
  { value: 'MANAGE_USERS',                label: 'Quản lý người dùng',    desc: 'Tạo/sửa/xóa user, gán permissions cho staff khác' },
  { value: 'VIEW_FINANCIAL_REPORTS',      label: 'Xem báo cáo tài chính', desc: 'Xem doanh thu, hoa hồng công ty (totalRevenue, commissionCompany)' },
  { value: 'EXPORT_DATA',                 label: 'Xuất dữ liệu',          desc: 'Xuất Excel danh sách phòng/giao dịch' },
  { value: 'MANAGE_COMPANIES',            label: 'Quản lý công ty',       desc: 'Tạo/sửa/xóa công ty BĐS đối tác' },
  { value: 'MANAGE_SYSTEM_SHARE_LINKS',   label: 'Quản lý link chia sẻ hệ thống', desc: 'Tạo/xóa link share cấp admin (toàn hệ thống)' },
];

type PermUser = {
  role?: string | null;
  permissions?: string[] | null;
} | null | undefined;

/**
 * Pure check — dùng được ở UI gate (client) và server.
 * Super-admin (role=ADMIN) bypass tất cả.
 * Staff (role=ADMIN_STAFF) cần permission trong array.
 * Các role khác → false.
 */
export function hasPermission(user: PermUser, perm: AdminPermission): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'ADMIN_STAFF') return Array.isArray(user.permissions) && user.permissions.includes(perm);
  return false;
}

/** true nếu user là ADMIN hoặc ADMIN_STAFF */
export function isAnyAdmin(user: PermUser): boolean {
  return user?.role === 'ADMIN' || user?.role === 'ADMIN_STAFF';
}
