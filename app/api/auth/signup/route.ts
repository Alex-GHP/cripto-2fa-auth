import { NextResponse } from 'next/server';
import { hashPassword, validateEmail } from '@/lib/auth/utils';
import pool from '@/lib/db/config';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email.toLowerCase(), hashedPassword]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 