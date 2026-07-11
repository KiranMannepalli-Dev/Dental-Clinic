import { Router, Request, Response } from "express";
import multer from "multer";
import { requireAdmin } from "../../middleware/auth";
import { uploadToCloudinary } from "../../utils/cloudinary";

const router = Router();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

/**
 * POST /admin/upload
 * Secured endpoint for uploading files to Cloudinary.
 * Accepts multipart/form-data under the key "file".
 */
router.post(
  "/",
  requireAdmin,
  upload.single("file"),
  async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: "BAD_REQUEST", message: "No file provided in form field 'file'." },
        });
      }

      const folder = (req.query.folder as string) || "dental_clinic";

      // Stream the buffer to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.buffer, folder);

      return res.status(200).json({
        success: true,
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: err.message || "Failed to upload file to Cloudinary",
        },
      });
    }
  }
);

export default router;
