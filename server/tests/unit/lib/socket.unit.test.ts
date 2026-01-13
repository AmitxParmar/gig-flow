import { jest } from '@jest/globals';
import { type Gig } from '@prisma/client';

// 1. Define mock objects
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
};

const mockEnvironment = {
    isDev: jest.fn(() => false),
    env: 'TEST',
};

const mockEmit = jest.fn();
const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
const mockOn = jest.fn();
const mockIo = {
    to: mockTo,
    emit: mockEmit,
    on: mockOn,
    use: jest.fn(),
};

// 2. Mock dependencies using jest.mock()
// Note: These will be hoisted to the top
jest.mock('@/lib/logger', () => ({
    __esModule: true,
    default: mockLogger,
}));

jest.mock('@/lib/environment', () => ({
    __esModule: true,
    default: mockEnvironment,
}));

jest.mock('@/lib/jwt', () => ({
    __esModule: true,
    default: {
        verifyAccessToken: jest.fn(),
    },
}));

jest.mock('@/modules/auth/auth.repository', () => ({
    __esModule: true,
    default: {
        findUserById: jest.fn(),
    },
}));

jest.mock('socket.io', () => {
    return {
        Server: jest.fn(() => mockIo),
    };
});

// 3. Import the service under test
import SocketService from '@/lib/socket';

describe('[Unit] - SocketService', () => {
    const mockGig: Gig = {
        id: 'gig-123',
        title: 'Test Gig',
        description: 'Test Description',
        budget: 500,
        status: 'OPEN',
        ownerId: 'user-1',
        hiredFreelancerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Manually inject the mock IO instance into the service
        // because verify/initializing it via http server is complex in unit test
        (SocketService as unknown as any).io = mockIo;
    });

    describe('notifyBidHired', () => {
        it('should emit bid:hired event to the specific user room', () => {
            const freelancerId = 'user-2';
            const payload = {
                bidId: 'bid-123',
                gigId: 'gig-123',
                bid: { id: 'bid-123' },
            };

            SocketService.notifyBidHired(freelancerId, payload);

            expect(mockTo).toHaveBeenCalledWith(`user:${freelancerId}`);
            expect(mockEmit).toHaveBeenCalledWith('bid:hired', payload);
        });
    });

    describe('emitGigCreated', () => {
        it('should emit gig:created event globally', () => {
            const payload = { gigId: mockGig.id, gig: mockGig };
            SocketService.emitGigCreated(payload);

            expect(mockEmit).toHaveBeenCalledWith('gig:created', payload);
        });
    });

    describe('emitGigUpdated', () => {
        it('should emit gig:updated event globally', () => {
            const payload = { gigId: mockGig.id, gig: mockGig };
            SocketService.emitGigUpdated(payload);

            expect(mockEmit).toHaveBeenCalledWith('gig:updated', payload);
        });
    });

    describe('emitGigDeleted', () => {
        it('should emit gig:deleted event globally', () => {
            const gigId = 'gig-123';
            SocketService.emitGigDeleted(gigId);

            expect(mockEmit).toHaveBeenCalledWith('gig:deleted', { gigId });
        });
    });
});
