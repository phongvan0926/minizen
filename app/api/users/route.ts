import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    const where: any = {};
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, password, role, isActive } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 400 });
    }

    const hashed = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, phone: phone || null, password: hashed, role, isActive: isActive ?? true },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, email, phone, password, role, isActive } = body;

    if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

    const currentUserId = (session.user as any).id;

    // Không cho đổi role chính mình
    if (id === currentUserId && role) {
      const self = await prisma.user.findUnique({ where: { id } });
      if (self && self.role !== role) {
        return NextResponse.json({ error: 'Không thể đổi vai trò của chính mình' }, { status: 400 });
      }
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
      }
      const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
      if (existing) {
        return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 });
      }
      updateData.password = await hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

    const currentUserId = (session.user as any).id;
    if (id === currentUserId) {
      return NextResponse.json({ error: 'Không thể xoá tài khoản đang đăng nhập' }, { status: 400 });
    }

    const [propertyCount, dealCount, shareLinkCount] = await Promise.all([
      prisma.property.count({ where: { landlordId: id } }),
      prisma.deal.count({ where: { brokerId: id } }),
      prisma.shareLink.count({ where: { brokerId: id } }),
    ]);

    const hasRelated = propertyCount > 0 || dealCount > 0 || shareLinkCount > 0;

    if (hasRelated) {
      // Soft delete
      await prisma.user.update({ where: { id }, data: { isActive: false } });
      return NextResponse.json({ deleted: false, deactivated: true, message: 'Đã vô hiệu hoá (có dữ liệu liên quan)' });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ deleted: true, deactivated: false, message: 'Đã xoá tài khoản' });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
