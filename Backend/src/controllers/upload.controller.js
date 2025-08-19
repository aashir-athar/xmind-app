import cloudinary from "../config/cloudinary.js";
import { ENV } from "../config/env.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Convert buffer to base64 for Cloudinary
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "xmind",
      resource_type: "auto",
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        width: uploadResponse.width,
        height: uploadResponse.height,
        format: uploadResponse.format,
        size: uploadResponse.bytes
      }
    });

  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message
    });
  }
};
