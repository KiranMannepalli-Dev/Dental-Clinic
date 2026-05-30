import { Router } from 'express';
import { prisma } from '../../config/database';
import { requireAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(requireAdmin);

// Get all patients with search and pagination
router.get('/', async (req, res, next) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } }
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { firstName: 'asc' },
        skip,
        take: limitNumber,
        include: {
          _count: {
            select: { appointments: true }
          }
        }
      }),
      prisma.patient.count({ where })
    ]);

    res.json({
      success: true,
      data: patients,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get a patient details including appointment history
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            doctor: true,
            service: true
          },
          orderBy: { appointmentDate: 'desc' }
        },
        medicalTests: {
          orderBy: { testDate: 'desc' }
        },
        billingInvoices: {
          orderBy: { createdAt: 'desc' }
        },
        patientReports: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Patient not found' }
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
});

const UpdatePatientSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).nullable().optional(),
  address: z.string().nullable().optional(),
  bloodGroup: z.string().nullable().optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().nullable().optional()
});

// Update a patient record
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = UpdatePatientSchema.parse(req.body);

    const patient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Patient not found' }
      });
    }

    const updateData: any = { ...data };
    if (data.dateOfBirth) {
      updateData.dateOfBirth = new Date(data.dateOfBirth);
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: updateData,
      include: {
        appointments: {
          include: {
            doctor: true,
            service: true
          }
        },
        medicalTests: {
          orderBy: { testDate: 'desc' }
        },
        billingInvoices: {
          orderBy: { createdAt: 'desc' }
        },
        patientReports: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Patient medical record updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Zod schemas for EMR sub-resources
const CreateTestSchema = z.object({
  testName: z.string().min(1),
  category: z.string().min(1),
  cost: z.union([z.number(), z.string()]),
  result: z.string().optional().nullable(),
  status: z.string().optional(),
  testDate: z.string().optional(),
  notes: z.string().optional().nullable(),
});

const UpdateTestSchema = CreateTestSchema.partial();

const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  items: z.array(z.object({
    description: z.string().min(1),
    amount: z.number().positive(),
  })),
  discount: z.union([z.number(), z.string()]).optional(),
  tax: z.union([z.number(), z.string()]).optional(),
  total: z.union([z.number(), z.string()]),
  paymentStatus: z.enum(['UNPAID', 'PAID', 'PARTIALLY_PAID']).optional(),
  paymentMethod: z.string().optional().nullable(),
});

const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

const CreateReportSchema = z.object({
  title: z.string().min(1),
  fileUrl: z.string().min(1),
  reportType: z.string().min(1),
  notes: z.string().optional().nullable(),
});

// --- EMR ENDPOINTS ---

// Create Medical Test
router.post('/:id/tests', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = CreateTestSchema.parse(req.body);

    const test = await prisma.medicalTest.create({
      data: {
        ...body,
        patientId: id,
        cost: String(body.cost),
        testDate: body.testDate ? new Date(body.testDate) : undefined,
      }
    });

    res.status(201).json({ success: true, data: test });
  } catch (error) {
    next(error);
  }
});

// Update Medical Test
router.patch('/:id/tests/:testId', async (req, res, next) => {
  try {
    const { testId } = req.params;
    const body = UpdateTestSchema.parse(req.body);

    const test = await prisma.medicalTest.update({
      where: { id: testId },
      data: {
        ...body,
        cost: body.cost !== undefined ? String(body.cost) : undefined,
        testDate: body.testDate ? new Date(body.testDate) : undefined,
      }
    });

    res.json({ success: true, data: test });
  } catch (error) {
    next(error);
  }
});

// Delete Medical Test
router.delete('/:id/tests/:testId', async (req, res, next) => {
  try {
    const { testId } = req.params;
    await prisma.medicalTest.delete({ where: { id: testId } });
    res.json({ success: true, message: 'Test record deleted' });
  } catch (error) {
    next(error);
  }
});

// Create Invoice
router.post('/:id/invoices', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = CreateInvoiceSchema.parse(req.body);

    const invoice = await prisma.billingInvoice.create({
      data: {
        patientId: id,
        invoiceNumber: body.invoiceNumber,
        items: body.items,
        discount: body.discount ? String(body.discount) : "0",
        tax: body.tax ? String(body.tax) : "0",
        total: String(body.total),
        paymentStatus: body.paymentStatus,
        paymentMethod: body.paymentMethod,
      }
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
});

// Update Invoice
router.patch('/:id/invoices/:invoiceId', async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const body = UpdateInvoiceSchema.parse(req.body);

    const invoice = await prisma.billingInvoice.update({
      where: { id: invoiceId },
      data: {
        invoiceNumber: body.invoiceNumber,
        items: body.items,
        discount: body.discount !== undefined ? String(body.discount) : undefined,
        tax: body.tax !== undefined ? String(body.tax) : undefined,
        total: body.total !== undefined ? String(body.total) : undefined,
        paymentStatus: body.paymentStatus,
        paymentMethod: body.paymentMethod,
      }
    });

    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
});

// Delete Invoice
router.delete('/:id/invoices/:invoiceId', async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    await prisma.billingInvoice.delete({ where: { id: invoiceId } });
    res.json({ success: true, message: 'Invoice record deleted' });
  } catch (error) {
    next(error);
  }
});

// Create Report
router.post('/:id/reports', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = CreateReportSchema.parse(req.body);

    const report = await prisma.patientReport.create({
      data: {
        ...body,
        patientId: id,
      }
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

// Delete Report
router.delete('/:id/reports/:reportId', async (req, res, next) => {
  try {
    const { reportId } = req.params;
    await prisma.patientReport.delete({ where: { id: reportId } });
    res.json({ success: true, message: 'Report record deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
