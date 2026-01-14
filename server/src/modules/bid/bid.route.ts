import { Router } from 'express';
import bidController from './bid.controller';
import { verifyAuthToken } from '@/middlewares/auth';
import RequestValidator from '@/middlewares/request-validator';
import { CreateBidDto, UpdateBidDto } from '@/dto/bid.dto';

const router: Router = Router();

/**
 * @openapi
 * /bids/my:
 *   get:
 *     summary: Get my placed bids
 *     description: Fetch all bids placed by the current user
 *     tags:
 *       - Bids
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Your bids fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/my',
    verifyAuthToken,
    bidController.getMyBids.bind(bidController)
);

/**
 * @openapi
 * /bids/{gigId}:
 *   get:
 *     summary: Get all bids for a gig
 *     description: Fetch all bids for a specific gig (owner only)
 *     tags:
 *       - Bids
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: gigId
 *         required: true
 *         schema:
 *           type: string
 *         description: Gig ID
 *     responses:
 *       200:
 *         description: Bids fetched successfully
 *       401:
 *         description: Unauthorized - only gig owner can view bids
 *       404:
 *         description: Gig not found
 */
router.get(
    '/:gigId',
    verifyAuthToken,
    bidController.getBidsForGig.bind(bidController)
);

/**
 * @openapi
 * /bids:
 *   post:
 *     summary: Submit a bid
 *     description: Submit a bid on an open gig
 *     tags:
 *       - Bids
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gigId
 *               - message
 *               - price
 *             properties:
 *               gigId:
 *                 type: string
 *                 description: MongoDB ObjectId
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               price:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Bid submitted successfully
 *       400:
 *         description: Validation error or cannot bid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Gig not found
 */
router.post(
    '/',
    verifyAuthToken,
    RequestValidator.validate(CreateBidDto),
    bidController.createBid.bind(bidController)
);

/**
 * @openapi
 * /bids/{bidId}:
 *   put:
 *     summary: Update a bid
 *     description: Update an existing bid (only pending bids, freelancer only)
 *     tags:
 *       - Bids
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bid ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Bid updated successfully
 *       400:
 *         description: Cannot update bid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bid not found
 */
router.put(
    '/:bidId',
    verifyAuthToken,
    RequestValidator.validate(UpdateBidDto),
    bidController.updateBid.bind(bidController)
);

/**
 * @openapi
 * /bids/{bidId}/hire:
 *   patch:
 *     summary: Hire a freelancer
 *     description: |
 *       Accept a bid and hire the freelancer. This atomic operation:
 *       - Changes the gig status to ASSIGNED
 *       - Sets the bid status to HIRED
 *       - Rejects all other pending bids
 *       - Sends real-time notifications
 *     tags:
 *       - Hiring
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bid ID to accept
 *     responses:
 *       200:
 *         description: Freelancer hired successfully
 *       400:
 *         description: Cannot hire - gig already assigned or bid not pending
 *       401:
 *         description: Unauthorized - only gig owner can hire
 *       404:
 *         description: Bid not found
 */
router.patch(
    '/:bidId/hire',
    verifyAuthToken,
    bidController.hireBid.bind(bidController)
);

export default router;
