import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class UserController {
  // Get all users (admin only)
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await prisma.users.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          isAdmin: true,
          description: true,
          servers: true
        }
      });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const user = await prisma.users.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          email: true,
          username: true,
          isAdmin: true,
          description: true,
          servers: true
        }
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  // Create new user
  static async createUser(req: Request, res: Response) {
    const { email, username, password, isAdmin } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.users.create({
        data: {
          email,
          username,
          password: hashedPassword,
          isAdmin: isAdmin || false
        }
      });
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      return res.status(201).json({ user, token });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { email, username, description } = req.body;
    try {
      const user = await prisma.users.update({
        where: { id: parseInt(id) },
        data: { email, username, description },
        select: {
          id: true,
          email: true,
          username: true,
          isAdmin: true,
          description: true
        }
      });
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // Delete user
  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.users.delete({
        where: { id: parseInt(id) }
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  // User login
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      return res.json({ token });
    } catch (error) {
      return res.status(500).json({ error: 'Login failed' });
    }
  }
}