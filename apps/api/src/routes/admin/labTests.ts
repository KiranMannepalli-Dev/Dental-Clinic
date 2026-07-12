import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(requireAdmin);

// Get all lab tests (MedicalTest records)
router.get('/', async (req, res, next) => {
  try {
    const tests = await prisma.medicalTest.findMany({
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: tests
    });
  } catch (error) {
    next(error);
  }
});

// Create a new lab test directly
const CreateLabTestSchema = z.object({
  patientName: z.string().min(1), // Used to find or create patient if not present, or store in logs
  testName: z.string().min(1),
  orderedBy: z.string().min(1), // Doctor name
  priority: z.enum(['ROUTINE', 'URGENT', 'STAT']),
  notes: z.string().optional().nullable(),
});

router.post('/', async (req, res, next) => {
  try {
    const body = CreateLabTestSchema.parse(req.body);

    // Find a matching patient by name or just use a dummy patient
    let patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { firstName: { contains: body.patientName.split(' ')[0], mode: 'insensitive' } }
        ]
      }
    });

    if (!patient) {
      // Create a temporary patient so we don't crash
      patient = await prisma.patient.create({
        data: {
          firstName: body.patientName.split(' ')[0] || 'Unknown',
          lastName: body.patientName.split(' ').slice(1).join(' ') || 'Patient',
          email: `${body.patientName.toLowerCase().replace(/\s/g, '')}@example.com`,
          phone: '0000000000',
        }
      });
    }

    // Create the medical test record
    const test = await prisma.medicalTest.create({
      data: {
        patientId: patient.id,
        testName: body.testName,
        category: 'Diagnostic',
        cost: body.priority === 'STAT' ? 1200 : body.priority === 'URGENT' ? 800 : 500,
        status: 'PENDING',
        // Store orderedBy in notes prefix or similar since orderedBy isn't on model directly
        notes: `Ordered By: ${body.orderedBy}. Notes: ${body.notes || ''}`
      },
      include: {
        patient: true
      }
    });

    res.status(201).json({
      success: true,
      data: test
    });
  } catch (error) {
    next(error);
  }
});

// Update test status / completion
const CompleteTestSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REPORTED']),
  result: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = CompleteTestSchema.parse(req.body);

    const test = await prisma.medicalTest.update({
      where: { id },
      data: {
        status: body.status,
        result: body.result,
        // If fileUrl is provided, we can also link it to PatientReport table!
        ...(body.fileUrl && {
          notes: `File attached: ${body.fileUrl}`
        })
      },
      include: {
        patient: true
      }
    });

    // If report is completed and has a fileUrl, create a PatientReport record!
    if (body.status === 'COMPLETED' && body.fileUrl) {
      await prisma.patientReport.create({
        data: {
          patientId: test.patientId,
          title: test.testName,
          fileUrl: body.fileUrl,
          reportType: 'LAB_REPORT',
          notes: body.result
        }
      });
    }

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    next(error);
  }
});

export default router;
