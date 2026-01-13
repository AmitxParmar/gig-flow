import mongoose from 'mongoose';
import logger from './logger';
import environment from './environment';

class Database {
    private static instance: Database;
    private isConnected = false;

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            logger.info('MongoDB: Already connected');
            return;
        }

        try {
            const uri = environment.databaseUrl;

            if (!uri) {
                throw new Error('DATABASE_URL is not defined in environment variables');
            }

            mongoose.set('strictQuery', true);

            await mongoose.connect(uri);

            this.isConnected = true;
            logger.info('MongoDB: Connected successfully');

            mongoose.connection.on('error', (error) => {
                logger.error('MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB: Disconnected');
                this.isConnected = false;
            });

        } catch (error) {
            logger.error('MongoDB: Connection failed', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info('MongoDB: Disconnected successfully');
        } catch (error) {
            logger.error('MongoDB: Disconnect failed', error);
            throw error;
        }
    }

    public getConnection(): typeof mongoose {
        return mongoose;
    }

    public async startTransaction(): Promise<mongoose.ClientSession> {
        const session = await mongoose.startSession();
        session.startTransaction();
        return session;
    }
}

export default Database.getInstance();
