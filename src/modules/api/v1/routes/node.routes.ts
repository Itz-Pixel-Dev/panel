import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { NodeController } from '../controllers/node.controller';
import { authenticateJWT, authorize } from '../middleware/auth.middleware';

const router = Router();

// Wrap async controller methods to handle errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Node routes (admin only)
router.get(
  '/',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(NodeController.getNodes)
);

router.get(
  '/:id',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(NodeController.getNodeById)
);

router.post(
  '/',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(NodeController.createNode)
);

router.put(
  '/:id',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(NodeController.updateNode)
);

router.delete(
  '/:id',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(NodeController.deleteNode)
);

router.get(
  '/:id/stats',
	authenticateJWT as RequestHandler,
	authorize('admin') as RequestHandler,
	asyncHandler(NodeController.getNodeStats)
);

export default router;