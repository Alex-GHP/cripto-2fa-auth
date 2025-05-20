import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from './config';

export interface User {
    id: number;
    email: string;
    password: string;
    email_verified: boolean;
}

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: { id: number; email: string }): string => {
    return jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET || '',
        { expiresIn: JWT_EXPIRES_IN }
    );
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET || '') as { id: number; email: string };
    } catch (error) {
        return null;
    }
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}; 