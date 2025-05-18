import { NextResponse } from 'next/server';
import { comparePasswords, generateToken, validateEmail } from '@/lib/auth/utils';
import { generateCode, storeCode } from '@/lib/auth/two-factor';
import { sendAuthCode } from '@/lib/email/email-service';
import pool from '@/lib/db/config';

export async function POST(request: Request) {
    try {
        const { email, password, code } = await request.json();

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

        const result = await pool.query(
            'SELECT id, email, password, email_verified FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        const user = result.rows[0];

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (code) {
            const userVerifyResult = await pool.query(
                `SELECT * FROM auth_codes 
                WHERE user_id = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()`,
                [user.id, code]
            );

            if (userVerifyResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Invalid or expired code' },
                    { status: 401 }
                );
            }

            await pool.query(
                'UPDATE auth_codes SET used = TRUE WHERE id = $1',
                [userVerifyResult.rows[0].id]
            );

            const token = generateToken({ id: user.id, email: user.email });

            return NextResponse.json({
                token,
                email_verified: user.email_verified,
                twoFactorVerified: true
            });
        } else {
            const authCode = generateCode();
            const codeStored = await storeCode(user.id, authCode);

            if (!codeStored) {
                return NextResponse.json(
                    { error: 'Failed to generate authentication code' },
                    { status: 500 }
                );
            }

            const emailResult = await sendAuthCode(user.email, authCode);

            if (!emailResult.success) {
                return NextResponse.json(
                    { error: 'Failed to send authentication code' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                userId: user.id,
                email: user.email,
                requiresTwoFactor: true
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 