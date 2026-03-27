import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'BROKER' | 'LANDLORD' | 'CUSTOMER';
      phone?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'BROKER' | 'LANDLORD' | 'CUSTOMER';
    id: string;
    phone?: string;
  }
}
