import User, { IUser } from '@/models/User';

export interface SafeUser {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export class UserRepository {
    /**
     * Finds all users with optional search and exclusion
     */
    public async findAll(search?: string, excludeUserId?: string): Promise<SafeUser[]> {
        const query: Record<string, any> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (excludeUserId) {
            query._id = { $ne: excludeUserId };
        }

        const users = await User.find(query)
            .select('-passwordHash')
            .lean();

        return users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
}

export default new UserRepository();
