import { Router } from 'express';
import gigController from './gig.controller';
import { verifyAuthToken, optionalAuth } from '@/middlewares/auth';
import RequestValidator from '@/middlewares/request-validator';
import { CreateGigDto, UpdateGigDto, GigQueryDto } from '@/dto/gig.dto';

const router: Router = Router();

/**
 * @openapi
 * /gigs:
 *   get:
 *     summary: Get all gigs
 *     description: Fetch all open gigs with optional search and filtering
 *     tags:
 *       - Gigs
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, ASSIGNED]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Gigs fetched successfully
 */
router.get(
    '/',
    optionalAuth,
    RequestValidator.validate(GigQueryDto, 'query'),
    gigController.getGigs.bind(gigController)
);

/**
 * @openapi
 * /gigs/my:
 *   get:
 *     summary: Get my posted gigs
 *     description: Fetch all gigs posted by the current user
 *     tags:
 *       - Gigs
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Your gigs fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/my',
    verifyAuthToken,
    RequestValidator.validate(GigQueryDto, 'query'),
    gigController.getMyGigs.bind(gigController)
);

/**
 * @openapi
 * /gigs/{id}:
 *   get:
 *     summary: Get a gig by ID
 *     description: Fetch a single gig by its ID
 *     tags:
 *       - Gigs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gig ID
 *     responses:
 *       200:
 *         description: Gig fetched successfully
 *       404:
 *         description: Gig not found
 */
router.get(
    '/:id',
    gigController.getGigById.bind(gigController)
);

/**
 * @openapi
 * /gigs:
 *   post:
 *     summary: Create a new gig
 *     description: Create a new job posting (requires authentication)
 *     tags:
 *       - Gigs
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - budget
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *               budget:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Gig created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/',
    verifyAuthToken,
    RequestValidator.validate(CreateGigDto),
    gigController.createGig.bind(gigController)
);

/**
 * @openapi
 * /gigs/{id}:
 *   put:
 *     summary: Update a gig
 *     description: Update an existing gig (owner only, gig must be OPEN)
 *     tags:
 *       - Gigs
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gig ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Gig updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Gig not found
 */
router.put(
    '/:id',
    verifyAuthToken,
    RequestValidator.validate(UpdateGigDto),
    gigController.updateGig.bind(gigController)
);

/**
 * @openapi
 * /gigs/{id}:
 *   delete:
 *     summary: Delete a gig
 *     description: Delete an existing gig (owner only, no bids allowed)
 *     tags:
 *       - Gigs
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gig ID
 *     responses:
 *       200:
 *         description: Gig deleted successfully
 *       400:
 *         description: Cannot delete gig with bids
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Gig not found
 */
router.delete(
    '/:id',
    verifyAuthToken,
    gigController.deleteGig.bind(gigController)
);

export default router;
