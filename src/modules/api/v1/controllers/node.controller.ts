import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NodeController {
	// Get all nodes (admin only)
	static async getNodes(req: Request, res: Response) {
		try {
			const nodes = await prisma.node.findMany({
				include: {
					servers: {
						select: {
							id: true,
							name: true,
							Memory: true,
							Cpu: true,
							Storage: true
						}
					}
				}
			});
			return res.json(nodes);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to fetch nodes' });
		}
	}

	// Get node by ID
	static async getNodeById(req: Request, res: Response) {
		const { id } = req.params;
		try {
			const node = await prisma.node.findUnique({
				where: { id: parseInt(id) },
				include: {
					servers: {
						select: {
							id: true,
							name: true,
							Memory: true,
							Cpu: true,
							Storage: true
						}
					}
				}
			});
			if (!node) {
				return res.status(404).json({ error: 'Node not found' });
			}
			return res.json(node);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to fetch node' });
		}
	}

	// Create new node
	static async createNode(req: Request, res: Response) {
		const { name, ram, cpu, disk, address, port, key } = req.body;
		try {
			const node = await prisma.node.create({
				data: {
					name,
					ram,
					cpu,
					disk,
					address,
					port,
					key
				}
			});
			return res.status(201).json(node);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to create node' });
		}
	}

	// Update node
	static async updateNode(req: Request, res: Response) {
		const { id } = req.params;
		const { name, ram, cpu, disk, address, port, key } = req.body;
		try {
			const node = await prisma.node.update({
				where: { id: parseInt(id) },
				data: {
					name,
					ram,
					cpu,
					disk,
					address,
					port,
					key
				},
				include: {
					servers: {
						select: {
							id: true,
							name: true,
							Memory: true,
							Cpu: true,
							Storage: true
						}
					}
				}
			});
			return res.json(node);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to update node' });
		}
	}

	// Delete node
	static async deleteNode(req: Request, res: Response) {
		const { id } = req.params;
		try {
			await prisma.node.delete({
				where: { id: parseInt(id) }
			});
			return res.status(204).send();
		} catch (error) {
			return res.status(500).json({ error: 'Failed to delete node' });
		}
	}

	// Get node statistics
	static async getNodeStats(req: Request, res: Response) {
		const { id } = req.params;
		try {
			const node = await prisma.node.findUnique({
				where: { id: parseInt(id) },
				include: {
					servers: {
						select: {
							Memory: true,
							Cpu: true,
							Storage: true
						}
					}
				}
			});

			if (!node) {
				return res.status(404).json({ error: 'Node not found' });
			}

			const stats = {
				totalRam: node.ram,
				totalCpu: node.cpu,
				totalDisk: node.disk,
				usedRam: node.servers.reduce((acc, server) => acc + server.Memory, 0),
				usedCpu: node.servers.reduce((acc, server) => acc + server.Cpu, 0),
				usedDisk: node.servers.reduce((acc, server) => acc + server.Storage, 0),
				serverCount: node.servers.length
			};

			return res.json(stats);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to fetch node statistics' });
		}
	}
}