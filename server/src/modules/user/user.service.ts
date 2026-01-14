
import userRepository from './user.repository';
import { type SafeUser } from './user.repository';

export default class UserService {
    /**
     * Get all users
     */
    public async getAllUsers(search?: string, userId?: string): Promise<SafeUser[]> {
        return userRepository.findAll(search, userId);
    }
}
