import { Router } from 'express';
import { authenticateJWT, authorize } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Render API management page
router.get('/api/manage', authenticateJWT, authorize('admin'), async (req, res) => {
  try {
    const stats = await getApiStats();
    res.render('admin/api/manage', {
      req,
      stats
    });
  } catch (error) {
    console.error('Error loading API management:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Render security logs page
router.get('/api/security', authenticateJWT, authorize('admin'), async (req, res) => {
  try {
    const stats = await getSecurityStats();
    res.render('admin/api/security', {
      req,
      stats
    });
  } catch (error) {
    console.error('Error loading security logs:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function getApiStats() {
  const [activeKeys, totalRequests24h] = await Promise.all([
    prisma.apiKey.count({ where: { active: true } }),
    prisma.securityLog.count({
      where: {
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        eventType: { startsWith: 'API_' }
      }
    })
  ]);

  return { activeKeys, totalRequests24h };
}

async function getSecurityStats() {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
	
  const [totalEvents, failedLogins, blockedIPs, apiKeyEvents] = await Promise.all([
    prisma.securityLog.count({
      where: { timestamp: { gte: last24h } }
    }),
    prisma.securityLog.count({
      where: {
        timestamp: { gte: last24h },
        eventType: 'AUTH_FAILED'
      }
    }),
    prisma.ipBlacklist.count(),
    prisma.securityLog.count({
      where: {
        timestamp: { gte: last24h },
        eventType: { startsWith: 'API_' }
      }
    })
  ]);

  return { totalEvents, failedLogins, blockedIPs, apiKeyEvents };
}

export default router;