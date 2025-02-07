import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class ApiKeyController {
  // Generate API key
  static async generateKey(req: Request, res: Response) {
    const { name, permissions, expiresIn } = req.body;
		
    try {
      const key = crypto.randomBytes(32).toString('hex');
      const expires = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

      const apiKey = await prisma.apiKey.create({
        data: {
          key,
          name,
          expires,
          permissions: {
            create: permissions.map((perm: string) => ({
              name: perm,
            }))
          }
        },
        include: {
          permissions: true
        }
      });

      return res.status(201).json({
        id: apiKey.id,
        key,
        name: apiKey.name,
        expires: apiKey.expires,
        permissions: apiKey.permissions.map(p => p.name)
      });
    } catch (error) {
      console.error('API key generation error:', error);
      return res.status(500).json({ error: 'Failed to generate API key' });
    }
  }

  // List API keys
  static async listKeys(req: Request, res: Response) {
    try {
      const apiKeys = await prisma.apiKey.findMany({
        where: {
          active: true
        },
        include: {
          permissions: true
        }
      });

      return res.json(apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        expires: key.expires,
        lastUsed: key.lastUsed,
        usageCount: key.usageCount,
        permissions: key.permissions.map(p => p.name)
      })));
    } catch (error) {
      console.error('API key listing error:', error);
      return res.status(500).json({ error: 'Failed to list API keys' });
    }
  }

  // Revoke API key
  static async revokeKey(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.apiKey.update({
        where: { id: parseInt(id) },
        data: { active: false }
      });

      return res.status(204).send();
    } catch (error) {
      console.error('API key revocation error:', error);
      return res.status(500).json({ error: 'Failed to revoke API key' });
    }
  }

  // Update API key permissions
  static async updatePermissions(req: Request, res: Response) {
    const { id } = req.params;
    const { permissions } = req.body;

    try {
      // Delete existing permissions
      await prisma.apiKeyPermission.deleteMany({
        where: { apiKeyId: parseInt(id) }
      });

      // Add new permissions
      const apiKey = await prisma.apiKey.update({
        where: { id: parseInt(id) },
        data: {
          permissions: {
            create: permissions.map((perm: string) => ({
              name: perm
            }))
          }
        },
        include: {
          permissions: true
        }
      });

      return res.json({
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions.map(p => p.name)
      });
    } catch (error) {
      console.error('API key permission update error:', error);
      return res.status(500).json({ error: 'Failed to update API key permissions' });
    }
  }

  // Get API key usage stats
  static async getKeyStats(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const apiKey = await prisma.apiKey.findUnique({
        where: { id: parseInt(id) },
        include: {
          permissions: true
        }
      });

      if (!apiKey) {
        return res.status(404).json({ error: 'API key not found' });
      }

      return res.json({
        id: apiKey.id,
        name: apiKey.name,
        usageCount: apiKey.usageCount,
        lastUsed: apiKey.lastUsed,
        expires: apiKey.expires,
        active: apiKey.active,
        permissions: apiKey.permissions.map(p => p.name)
      });
    } catch (error) {
      console.error('API key stats error:', error);
      return res.status(500).json({ error: 'Failed to get API key stats' });
    }
  }
}