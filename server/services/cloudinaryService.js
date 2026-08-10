const cloudinary = require('../config/cloudinary');

const uploadBuffer = (buffer, folder = 'notes-app') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};

const deleteImage = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadBuffer, deleteImage };
