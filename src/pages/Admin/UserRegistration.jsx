import React, { useState, useEffect } from 'react';
import axiosConfig from '../../axiosConfig';
import { Link } from 'react-router-dom';
import { IoIosRemoveCircleOutline, IoIosArrowDown } from 'react-icons/io';
import './UserRegistration.css';
import imageCompression from 'browser-image-compression';
import { AnimatePresence, motion } from 'framer-motion';

const UserRegistration = () => {
  const [isFileUploadEnabled, setIsFileUploadEnabled] = useState(false);
  const [formFields, setFormFields] = useState([
    {
      id: 1,
      label: 'Full Name',
      type: 'text',
      placeholder: 'Name',
      isDefault: true,
    },
    {
      id: 2,
      label: 'Email Address',
      type: 'email',
      placeholder: 'e-mail',
      isDefault: true,
    },
  ]);
  const [fetchedExtraFields, setFetchedExtraFields] = useState([]);
  const [newField, setNewField] = useState({
    label: '',
    type: '',
    placeholder: '',
    options: [],
  });

  const [formData, setFormData] = useState({});
  const [optionInput, setOptionInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const fieldTypes = [
    'text',
    'email',
    'number',
    'date',
    'dropdown',
    'radio',
    'checkbox',
  ];
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (notification.show) {
      timeoutId = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 2000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [notification.show]);

  useEffect(() => {
    const fetchExtraFields = async () => {
      try {
        const response = await axiosConfig.get('/add-user-extrafield/');

        const fieldsData = response.data?.data?.extra_fields || [];

        if (!Array.isArray(fieldsData)) {
          return;
        }

        const transformedFields = fieldsData.map((field, index) => {
          let processedOptions = [];

          if (field.field_option) {
            if (Array.isArray(field.field_option)) {
              processedOptions = field.field_option;
            } else if (typeof field.field_option === 'object') {
              processedOptions = Object.entries(field.field_option).map(
                ([key, value]) => ({
                  id: key,
                  value: value,
                })
              );
            }
          }

          return {
            id: `extra-${index}`,
            label: field.fields_name || '',
            type: field.fields_type || 'text',
            placeholder: field.placeholder || field.fields_name || '',
            options: processedOptions,
          };
        });

        setFetchedExtraFields(transformedFields);
      } catch (error) {}
    };

    fetchExtraFields();
  }, []);

  // Combine initial and fetched fields
  const allFormFields = [...formFields, ...fetchedExtraFields];

  const handleInputChange = (id, value) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Please select a valid CSV file.',
        });
        event.target.value = '';
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleAddField = async () => {
    const trimmedLabel = newField.label.trim();

    // Validation checks
    if (!trimmedLabel) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Field label cannot be empty.',
      });
      return;
    }

    if (!newField.type) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please choose a field type.',
      });
      return;
    }

    const isDuplicateField = allFormFields.some(
      (field) => field.label.toLowerCase() === trimmedLabel.toLowerCase()
    );

    if (isDuplicateField) {
      setNotification({
        show: true,
        type: 'error',
        message:
          'A field with this label already exists. Please choose a different label.',
      });
      return;
    }

    // Validate options for select, radio, and checkbox types
    if (['dropdown', 'radio', 'checkbox'].includes(newField.type)) {
      if (newField.options.length === 0) {
        setNotification({
          show: true,
          type: 'error',
          message: `Please add at least one option for ${newField.type} field type.`,
        });
        return;
      }
    }

    if (newField.type && trimmedLabel) {
      const fieldData = {
        fields_name: trimmedLabel,
        fields_type: newField.type,
        field_option: newField.options.reduce(
          (acc, option, index) => ({ ...acc, [`option${index + 1}`]: option }),
          {}
        ),
      };

      try {
        const response = await axiosConfig.post(
          '/add-user-extrafield/',
          fieldData
        );

        const newFieldToAdd = {
          id: `extra-${fetchedExtraFields.length}`,
          label: trimmedLabel,
          type: newField.type,
          placeholder: trimmedLabel,
          options: newField.options,
        };

        setFetchedExtraFields([...fetchedExtraFields, newFieldToAdd]);
        setNewField({
          label: '',
          type: '',
          placeholder: '',
          options: [],
        });
        setOptionInput(''); // Clear option input
        setNotification({
          show: true,
          type: 'success',
          message: 'Field added successfully!',
        });
      } catch (error) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Failed to add field. Please try again.',
        });
      }
    }
  };

  const handleDeleteField = async (label) => {
    try {
      if (!label) {
        // alert('Invalid field label.');
        return;
      }

      const response = await axiosConfig.delete(`/delete-user-fields/${label}`);

      if (response.status === 200) {
        setFetchedExtraFields(
          fetchedExtraFields.filter((field) => field.label !== label)
        );

        const updatedFormData = { ...formData };
        delete updatedFormData[label];
        setFormData(updatedFormData);

        // alert('Field deleted successfully!');
      } else {
      }
    } catch (error) {}
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setNewField({
        ...newField,
        options: [...newField.options, optionInput.trim()],
      });
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index) => {
    setNewField({
      ...newField,
      options: newField.options.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowRegistrationModal(true);
  };

  const compressFile = async (file) => {
    if (file.type.startsWith('image')) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        return await imageCompression(file, options);
      } catch (error) {
        return file;
      }
    }
    return file;
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please select a file first.',
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append('file', selectedFile);

      for (let pair of formData.entries()) {
      }

      const response = await axiosConfig.post('/csv-registration/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setNotification({
          show: true,
          type: 'success',
          message: 'File uploaded successfully!',
        });
        setSelectedFile(null);
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message:
          error.response?.data?.message ||
          'Failed to upload file. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (field) => {
    switch (field.type) {
      case 'dropdown':
        return (
          <div key={field.id} className="mb-4">
            <select
              name={field.id}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all outline-none pr-10"
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            >
              <option value="">Select {field.label}</option>
              {field.options &&
                field.options.map((option, idx) => (
                  <option
                    key={`${field.id}-option-${idx}`}
                    value={option.value || option}
                  >
                    {option.value || option}
                  </option>
                ))}
            </select>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="mb-4">
            <div className="space-y-2">
              {field.options &&
                field.options.map((option, idx) => (
                  <label
                    key={`${field.id}-option-${idx}`}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={option.value || option}
                      onChange={handleInputChange}
                      disabled
                      className="w-4 h-4 text-black border-gray-300 focus:ring-gray-200"
                    />
                    <span className="text-gray-700">
                      {option.value || option}
                    </span>
                  </label>
                ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <div className="space-y-2">
              {field.options &&
                field.options.map((option, idx) => (
                  <label
                    key={`${field.id}-option-${idx}`}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      name={field.id}
                      value={option.value || option}
                      onChange={handleInputChange}
                      disabled // This prevents interaction
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-gray-200"
                    />
                    <span className="text-gray-700">
                      {option.value || option}
                    </span>
                  </label>
                ))}
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className="mb-4">
            <input
              type={field.type}
              name={field.id}
              placeholder={field.placeholder}
              onChange={handleInputChange}
              readOnly // This prevents typing
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all outline-none"
            />
          </div>
        );
    }
  };

  const ErrorPopup = () => (
    <AnimatePresence>
      {notification.show && notification.type === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-5 right-5 bg-white rounded-lg p-6 max-w-md"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Error</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() =>
                setNotification({ show: false, type: '', message: '' })
              }
              className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const generateRegistrationLink = () => {
    // Get the current domain
    const domain = window.location.origin;
    return `${domain}/registration-form`;
  };

  const RegistrationModal = () => {
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const registrationLink = generateRegistrationLink();

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(registrationLink);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    };

    if (!showRegistrationModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all animate-modal-enter">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
              Choose Registration Method
            </h3>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowRegistrationModal(false);
                  setIsFileUploadEnabled(true);
                }}
                className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-all flex items-center justify-center gap-3"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>CSV File Upload</span>
              </button>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setGeneratedLink(registrationLink);
                  }}
                  className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>Generate Shareable Link</span>
                </button>

                {generatedLink && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        value={registrationLink}
                        readOnly
                        className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-sm text-gray-600"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                      >
                        {showCopySuccess ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Share this link with users to allow them to register
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setShowRegistrationModal(false);
                setGeneratedLink('');
              }}
              className="mt-6 w-full py-3 px-4 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full  lg:flex-row flex-col-reverse gap-8 registration-section-main">
      <ErrorPopup />
      <RegistrationModal />

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div
        className={`w-full left-sec ${
          !isFileUploadEnabled ? 'lg:w-1/2' : ''
        } regi-main`}
      >
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-8">
          <div className="flex justify-between items-center mb-8 header-btn-sec">
            <h2 className="text-2xl font-semibold text-gray-800">
              User Registration
            </h2>
          </div>

          {isFileUploadEnabled ? (
            <div className="w-full max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-8 ">
                <div className="space-y-4">
                  <button
                    onClick={() => setIsFileUploadEnabled(false)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to Form
                  </button>

                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        Click to upload CSV file
                      </span>
                    </label>
                    {selectedFile && (
                      <div className="mt-4 text-sm text-gray-600">
                        Selected: {selectedFile.name}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleFileUpload}
                    disabled={loading || !selectedFile}
                    className={`w-full py-3 rounded-xl transition-all duration-200 ${
                      loading || !selectedFile
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {loading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {allFormFields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    {!field.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteField(field.label)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Remove field"
                      >
                        <IoIosRemoveCircleOutline className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {renderInputField(field)}
                </div>
              ))}

              {generatedLink && (
                <div className="text-center text-gray-700">
                  Successfully registered! Click{' '}
                  <Link
                    to={generatedLink}
                    className="text-black hover:underline"
                  >
                    here
                  </Link>{' '}
                  to continue.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Continue
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Field Addition Section - Only show when not in file upload mode */}
      {!isFileUploadEnabled && (
        <div className="w-full right-sect lg:w-1/2">
          <div className="bg-black rounded-2xl shadow-sm p-5 sm:p-8 h-full">
            <h3 className="text-xl font-semibold mb-8 text-white">
              Customize Registration Form
            </h3>
            <div className="bg-white rounded-xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newField.label}
                  onChange={(e) =>
                    setNewField({ ...newField, label: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all"
                  placeholder="Enter field label"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newField.type}
                    onChange={(e) => {
                      setNewField({
                        ...newField,
                        type: e.target.value,
                        options: [],
                      });
                      setOptionInput('');
                    }}
                    className="w-full p-3 pr-10 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Choose field type</option>
                    {fieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <IoIosArrowDown className="text-gray-400 w-5 h-5" />
                  </div>
                </div>
              </div>

              {['dropdown', 'radio', 'checkbox'].includes(newField.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        className="flex-1 p-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all"
                        placeholder="Add an option"
                      />
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {newField.options.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {newField.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white p-2 rounded-md"
                          >
                            <span className="text-sm text-gray-600">
                              {option}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <IoIosRemoveCircleOutline className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddField}
                className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Add New Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRegistration;
