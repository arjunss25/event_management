import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import axiosInstance from '../../axiosConfig';
import { motion } from 'framer-motion';
import { ImagePlus, ArrowRight, AlertCircle } from 'lucide-react';

const EventProfilePhotoPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch existing event profile picture
  useEffect(() => {
    const fetchEventProfilePicture = async () => {
      try {
        const response = await axiosInstance.get('/update-event-dp/');
        console.log('Full Response:', response.data);

        // Get image URL from the data object
        let imageUrl = null;
        if (response.data.data && response.data.data.image) {
          imageUrl = response.data.data.image.startsWith('http')
            ? response.data.data.image
            : `https://event.neurocode.in${response.data.data.image}`;
        }

        if (imageUrl) {
          console.log('Attempting to load image URL:', imageUrl);
          const img = new Image();
          img.onload = () => {
            setExistingImage(imageUrl);
            setIsLoading(false);
          };
          img.onerror = () => {
            console.log('Failed to load image');
            setExistingImage(null);
            setIsLoading(false);
          };
          img.src = imageUrl;
        } else {
          console.log('No image URL found in the response');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch event profile picture', error);
        setIsLoading(false);
      }
    };

    fetchEventProfilePicture();
  }, []);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.7
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
        if (file.size > 5 * 1024 * 1024) {
          const compressedFile = await compressImage(file);
          setSelectedFile(compressedFile);
        } else {
          setSelectedFile(file);
        }
        setUploadError(null);
      } catch (error) {
        setUploadError('Failed to compress image. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    // Only validate for new image if no existing image
    if (!selectedFile && !existingImage) {
      setUploadError('Please select an event profile picture');
      return;
    }

    // Only upload if there's a new image selected
    if (selectedFile) {
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
      } catch (error) {
        console.error('Upload failed', error);
        setUploadError(error.response?.data?.message || 'Upload failed. Please try again.');
        setIsUploading(false);
        return; // Don't navigate if upload fails
      }
    }

    // Navigate to next page regardless of whether we uploaded or not
    navigate('/admin/dashboard');
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <span className="loading-spinner">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {existingImage ? 'Event Profile Picture' : 'Add Event Profile Picture'}
        </h1>
        <p className="text-gray-600 mb-6">
          {existingImage 
            ? 'Your event profile picture is shown below. Click on it to change if needed.'
            : 'Choose an eye-catching image that represents your event. This will be shown to attendees and on event listings.'}
        </p>

        <div 
          onClick={triggerFileInput}
          className="w-64 h-64 mx-auto mb-6 rounded-full border-4 border-dashed border-gray-300 overflow-hidden cursor-pointer group relative transition-all duration-300 hover:border-blue-400"
        >
          {existingImage ? (
            <img
              src={existingImage}
              alt="Existing Event Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('Image load error');
                setExistingImage(null);
              }}
            />
          ) : selectedFile ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Event Profile Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 space-y-2">
              <ImagePlus className="w-16 h-16" />
              <span className="text-sm">Click to upload</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {uploadError && (
          <div className="mb-4 flex items-center justify-center text-red-500">
            <AlertCircle className="mr-2" />
            {uploadError}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!selectedFile && !existingImage || isUploading}
          className={`w-full py-3 rounded-lg flex items-center justify-center text-white font-bold transition-all ${
            (selectedFile || existingImage) && !isUploading
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isUploading ? 'Uploading...' : selectedFile ? 'Update Picture' : 'Next'}
          <ArrowRight className="ml-2" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default EventProfilePhotoPage;