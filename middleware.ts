import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/utils';

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith('/api/')) {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = verifyToken(token);
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const headers = new Headers(request.headers);
        headers.set('x-user-id', user.id.toString());
        headers.set('x-user-email', user.email);

        return NextResponse.next({
            headers,
        });
    }

    return NextResponse.next();
} 