import { type Request } from 'express';

// User type for Mongoose - matches the User model transforms
export interface SafeUser {
    _id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface AuthRequest extends Request {
    user?: SafeUser;
}

export interface SessionData {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
}
