import User from '@/models/User';
import Session from '@/models/Session';
import { type SessionData, type SafeUser } from '@/types/auth.type';

// Type for user data returned by lean queries (includes password for auth checks)
export interface UserDocument {
    _id: any;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

// Type for session data returned by lean queries
export interface SessionDocument {
    _id: any;
    userId: any;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    createdAt: Date;
}

// Helper to transform lean document to include id
const transformUser = (user: any): SafeUser => ({
    ...user,
    // Ensure _id exists, and compatible with SafeUser interface
    _id: user._id,
    // We remove explicit 'id' setting here to rely on _id. 
    // If SafeUser needs id, we might need to cast or updated SafeUser type.
    // For now assuming SafeUser is compatible or updated to optional id.
});

export class AuthRepository {
    public async createUser(data: {
        email: string;
        name: string;
        passwordHash: string;
    }): Promise<SafeUser> {
        const user = await User.create(data);
        // user.toJSON() now returns object with _id (after our Model fix)
        return user.toJSON() as unknown as SafeUser;
    }

    public async findUserByEmail(email: string): Promise<UserDocument | null> {
        const user = await User.findOne({ email }).lean();
        if (!user) return null;

        return user as unknown as UserDocument;
    }

    public async findUserById(id: string): Promise<SafeUser | null> {
        const user = await User.findById(id)
            .select('-passwordHash')
            .lean();

        if (!user) return null;
        return user as unknown as SafeUser;
    }

    public async createSession(data: SessionData): Promise<SessionDocument> {
        const session = await Session.create({
            userId: data.userId,
            refreshToken: data.refreshToken,
            userAgent: data.userAgent,
            ipAddress: data.ipAddress,
            expiresAt: data.expiresAt,
        });

        // session.toJSON() now returns object with _id
        return session.toJSON() as unknown as SessionDocument;
    }

    public async findSessionByToken(refreshToken: string): Promise<SessionDocument | null> {
        const session = await Session.findOne({ refreshToken }).lean();
        if (!session) return null;

        return session as unknown as SessionDocument;
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

        return user as unknown as SafeUser;
    }
}

export default new AuthRepository();
