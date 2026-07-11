import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/v1/webhooks/sheets
router.post('/sheets', async (req, res) => {
  try {
    // Basic security check (could be enhanced with a secret token)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET || 'supersecret'}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sheetName, rowData, action } = req.body;

    if (!sheetName || !rowData || !action) {
      return res.status(400).json({ error: 'Missing required payload data' });
    }

    console.log(`Received webhook from Sheets for [${sheetName}], Action: ${action}`, rowData);

    // Simple mapping logic
    if (sheetName === 'Services') {
      const { id, name, category, priceMin, priceMax, isActive } = rowData;
      
      if (!id) {
         return res.status(400).json({ error: 'ID is required for mapping' });
      }

      if (action === 'edit') {
        await prisma.service.update({
          where: { id: id.toString() },
          data: {
            name,
            category,
            priceMin: priceMin ? priceMin.toString() : null,
            priceMax: priceMax ? priceMax.toString() : null,
            isActive: isActive === 'TRUE' || isActive === 'true' || isActive === true,
          }
        });
      } else if (action === 'delete') {
         await prisma.service.delete({
            where: { id: id.toString() }
         });
      }
    }
    // Add other tables here as needed (Appointments, Users, etc.)

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing Sheets webhook:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
