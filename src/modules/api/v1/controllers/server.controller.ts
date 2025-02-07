import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ServerController {
	// Get all servers (admin only)
	static async getServers(req: Request, res: Response) {
		try {
			const servers = await prisma.server.findMany({
				include: {
					owner: {
						select: {
							id: true,
							username: true,
							email: true
						}
					},
					node: true,
					image: true
				}
			});
			return res.json(servers);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to fetch servers' });
		}
	}

	// Get server by ID
	static async getServerById(req: Request, res: Response) {
		const { id } = req.params;
		try {
			const server = await prisma.server.findUnique({
				where: { id: parseInt(id) },
				include: {
					owner: {
						select: {
							id: true,
							username: true,
							email: true
						}
					},
					node: true,
					image: true
				}
			});
			if (!server) {
				return res.status(404).json({ error: 'Server not found' });
			}
			return res.json(server);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to fetch server' });
		}
	}

	// Create new server
	static async createServer(req: Request, res: Response) {
		const { name, description, memory, cpu, storage, ownerId, nodeId, imageId, ports, startCommand, dockerImage } = req.body;
		try {
			const server = await prisma.server.create({
				data: {
					name,
					description,
					Memory: memory,
					Cpu: cpu,
					Storage: storage,
					ownerId,
					nodeId,
					imageId,
					Ports: ports,
					StartCommand: startCommand,
					dockerImage,
					Installing: true,
					Suspended: false
				},
				include: {
					owner: {
						select: {
							id: true,
							username: true,
							email: true
						}
					},
					node: true,
					image: true
				}
			});
			return res.status(201).json(server);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to create server' });
		}
	}

	// Update server
	static async updateServer(req: Request, res: Response) {
		const { id } = req.params;
		const { name, description, memory, cpu, storage, startCommand, dockerImage, suspended } = req.body;
		try {
			const server = await prisma.server.update({
				where: { id: parseInt(id) },
				data: {
					name,
					description,
					Memory: memory,
					Cpu: cpu,
					Storage: storage,
					StartCommand: startCommand,
					dockerImage,
					Suspended: suspended
				},
				include: {
					owner: {
						select: {
							id: true,
							username: true,
							email: true
						}
					},
					node: true,
					image: true
				}
			});
			return res.json(server);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to update server' });
		}
	}

	// Delete server
	static async deleteServer(req: Request, res: Response) {
		const { id } = req.params;
		try {
			await prisma.server.delete({
				where: { id: parseInt(id) }
			});
			return res.status(204).send();
		} catch (error) {
			return res.status(500).json({ error: 'Failed to delete server' });
		}
	}

	// Get user's servers
	static async getUserServers(req: Request, res: Response) {
		const userId = req.user?.id;
		try {
			const servers = await prisma.server.findMany({
				where: { ownerId: userId },
				include: {
					node: true,
					image: true
				}
			});
			return res.json(servers);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to fetch user servers' });
		}
	}
}