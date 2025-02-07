import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { ServerController } from '../controllers/server.controller';
import { authenticateJWT, authorize } from '../middleware/auth.middleware';

const router = Router();

// Wrap async controller methods to handle errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

// Server routes
router.get(
	'/',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(ServerController.getServers)
);

router.get(
	'/:id',
	authenticateJWT as RequestHandler,
	asyncHandler(ServerController.getServerById)
);

router.post(
	'/',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(ServerController.createServer)
);

router.put(
	'/:id',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(ServerController.updateServer)
);

router.delete(
	'/:id',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(ServerController.deleteServer)
);

router.get(
	'/user/servers',
	authenticateJWT as RequestHandler,
	asyncHandler(ServerController.getUserServers)
);

export default router;