import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import axiosInstance from '../../axiosConfig';

const ProfilePhotoPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const navigate = useNavigate();

  const compressImage = async (file) => {
    // Compression options
    const options = {
      maxSizeMB: 1,          // Maximum file size in megabytes
      maxWidthOrHeight: 1920, // Maximum width or height of the image
      useWebWorker: true,     // Use web worker for better performance
      initialQuality: 0.7     // Initial image quality (0-1)
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Image compression failed', error);
      throw error;
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Check initial file size
        if (file.size > 5 * 1024 * 1024) { // 5MB threshold
          const compressedFile = await compressImage(file);
          setSelectedFile(compressedFile);
          
          // Optional: Show file size reduction info
          console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        } else {
          setSelectedFile(file);
        }
      } catch (error) {
        setUploadError('Failed to compress image. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile, selectedFile.name);

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await axiosInstance.patch('/update-event-dp/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload successful', response.data);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Upload failed', error);
      setUploadError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800 p-4">
      <h1 className="text-2xl font-bold mb-6">Add Your Profile Photo</h1>
      
      <div className="w-48 h-48 mb-6">
        {selectedFile && (
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Profile Preview"
            className="w-full h-full rounded-full object-cover border border-gray-300"
          />
        )}
      </div>
      
      <input
        type="file"
        accept="image/*"
        className="mb-4"
        onChange={handleFileChange}
      />
      
      {uploadError && (
        <div className="text-red-500 mb-4">
          {uploadError}
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        className={`px-6 py-3 rounded-lg shadow-md transition-all ${
          selectedFile 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Submit'}
      </button>
    </div>
  );
};

export default ProfilePhotoPage;