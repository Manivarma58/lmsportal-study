import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded.',
      });
    }

    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'lms_portal',
          resource_type: 'auto',
        });

        fs.unlinkSync(req.file.path);

        return res.status(200).json({
          success: true,
          message: 'File uploaded to Cloudinary successfully!',
          fileUrl: result.secure_url,
          format: result.format,
          size: result.bytes,
        });
      } catch (cloudErr) {
        console.error('Cloudinary upload failed, falling back to local URL:', cloudErr);
      }
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded locally successfully!',
      fileUrl,
      fileName: req.file.filename,
      size: req.file.size,
    });
  } catch (err) {
    next(err);
  }
};
