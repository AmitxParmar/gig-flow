import { Router } from 'express';

import auth from './auth/auth.route';
import gig from './gig/gig.route';
import notification from './notification/notification.route';
import user from './user/user.route';

const router: Router = Router();

router.use('/auth', auth);
router.use('/gigs', gig);
router.use('/notifications', notification);
router.use('/users', user);

export default router;
