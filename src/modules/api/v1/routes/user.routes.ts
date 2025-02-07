import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, authorize, apiLimiter } from '../middleware/auth.middleware';

const router = Router();

// Wrap async controller methods to handle errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

// User routes
router.get(
	'/',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(UserController.getUsers)
);

router.get(
	'/:id',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(UserController.getUserById)
);

router.post(
	'/',
	apiLimiter as RequestHandler,
	asyncHandler(UserController.createUser)
);

router.put(
	'/:id',
	authenticateJWT as RequestHandler,
	asyncHandler(UserController.updateUser)
);

router.delete(
	'/:id',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(UserController.deleteUser)
);

router.post(
	'/login',
	apiLimiter as RequestHandler,
	asyncHandler(UserController.login)
);

export default router;