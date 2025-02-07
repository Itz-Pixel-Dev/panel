import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const { error } = schema.validate(req.body, { abortEarly: false });
		
		if (error) {
			const errorMessage = error.details.map(detail => detail.message).join(', ');
			return res.status(400).json({
				error: 'Validation Error',
				details: errorMessage
			});
		}
		
		next();
	};
};

// User validation schemas
export const userSchemas = {
	create: Joi.object({
		email: Joi.string().email().required(),
		username: Joi.string().min(3).max(30).required(),
		password: Joi.string().min(6).required(),
		isAdmin: Joi.boolean()
	}),
	update: Joi.object({
		email: Joi.string().email(),
		username: Joi.string().min(3).max(30),
		description: Joi.string()
	}),
	login: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required()
	})
};

// API key validation schemas
export const apiKeySchemas = {
    generate: Joi.object({
        name: Joi.string().required(),
        permissions: Joi.array().items(Joi.string()).required(),
        expiresIn: Joi.number().optional()
    }),
    updatePermissions: Joi.object({
        permissions: Joi.array().items(Joi.string()).required()
    })
};

// Server validation schemas
export const serverSchemas = {
	create: Joi.object({
		name: Joi.string().required(),
		description: Joi.string(),
		memory: Joi.number().required(),
		cpu: Joi.number().required(),
		storage: Joi.number().required(),
		ownerId: Joi.number().required(),
		nodeId: Joi.number().required(),
		imageId: Joi.number().required(),
		ports: Joi.string().required(),
		startCommand: Joi.string(),
		dockerImage: Joi.string()
	}),
	update: Joi.object({
		name: Joi.string(),
		description: Joi.string(),
		memory: Joi.number(),
		cpu: Joi.number(),
		storage: Joi.number(),
		startCommand: Joi.string(),
		dockerImage: Joi.string(),
		suspended: Joi.boolean()
	})
};

// Node validation schemas
export const nodeSchemas = {
	create: Joi.object({
		name: Joi.string().required(),
		ram: Joi.number().required(),
		cpu: Joi.number().required(),
		disk: Joi.number().required(),
		address: Joi.string().required(),
		port: Joi.number().required(),
		key: Joi.string().required()
	}),
	update: Joi.object({
		name: Joi.string(),
		ram: Joi.number(),
		cpu: Joi.number(),
		disk: Joi.number(),
		address: Joi.string(),
		port: Joi.number(),
		key: Joi.string()
	})
};