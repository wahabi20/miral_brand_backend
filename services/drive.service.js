const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadFile(buffer, mimeType, filename) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    console.warn('⚠️  Cloudinary non configuré — image ignorée');
    return null;
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'miral-brand',
          resource_type: 'image',
          public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return {
      fileId: result.public_id,
      url:    result.secure_url,
      name:   filename
    };
  } catch (err) {
    console.warn('⚠️  Cloudinary upload error:', err.message);
    return null;
  }
}

async function deleteFile(fileId) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') return;
  try {
    await cloudinary.uploader.destroy(fileId);
  } catch (err) {
    console.warn('Cloudinary delete warning:', err.message);
  }
}

module.exports = { uploadFile, deleteFile };
