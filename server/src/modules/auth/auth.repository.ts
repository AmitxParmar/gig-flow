import User from '@/models/User';
import Session from '@/models/Session';
import { type SessionData, type SafeUser } from '@/types/auth.type';

// Type for user data returned by lean queries
export interface UserDocument {
    _id: any;
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

// Type for session data returned by lean queries
export interface SessionDocument {
    _id: any;
    id?: string;
    userId: any;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    createdAt: Date;
}

// Helper to transform lean document to include id
const transformUser = (user: any): SafeUser => ({
    id: user._id?.toString() || user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export class AuthRepository {
    public async createUser(data: {
        email: string;
        name: string;
        passwordHash: string;
    }): Promise<SafeUser> {
        const user = await User.create(data);
        return transformUser(user.toJSON());
    }

    public async findUserByEmail(email: string): Promise<UserDocument | null> {
        const user = await User.findOne({ email }).lean();
        if (!user) return null;

        return {
            ...user,
            id: user._id.toString(),
        };
    }

    public async findUserById(id: string): Promise<SafeUser | null> {
        const user = await User.findById(id)
            .select('-passwordHash')
            .lean();

        if (!user) return null;
        return transformUser(user);
    }

    public async createSession(data: SessionData): Promise<SessionDocument> {
        const session = await Session.create({
            userId: data.userId,
            refreshToken: data.refreshToken,
            userAgent: data.userAgent,
            ipAddress: data.ipAddress,
            expiresAt: data.expiresAt,
        });

        return {
            _id: session._id,
            id: session._id.toString(),
            userId: session.userId,
            refreshToken: session.refreshToken,
            userAgent: session.userAgent,
            ipAddress: session.ipAddress,
            expiresAt: session.expiresAt,
            createdAt: session.createdAt,
        };
    }

    public async findSessionByToken(refreshToken: string): Promise<SessionDocument | null> {
        const session = await Session.findOne({ refreshToken }).lean();
        if (!session) return null;

        return {
            ...session,
            id: session._id.toString(),
        };
    }

    public async deleteSession(refreshToken: string): Promise<void> {
        await Session.deleteOne({ refreshToken });
    }

    public async deleteAllUserSessions(userId: string): Promise<void> {
        await Session.deleteMany({ userId });
    }

    public async deleteExpiredSessions(): Promise<void> {
        await Session.deleteMany({
            expiresAt: { $lt: new Date() },
        });
    }

    public async updateUser(
        id: string,
        data: { name?: string; email?: string }
    ): Promise<SafeUser> {
        const user = await User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, select: '-passwordHash' }
        ).lean();

        if (!user) {
            throw new Error('User not found');
        }

        return transformUser(user);
    }
}

export default new AuthRepository();
