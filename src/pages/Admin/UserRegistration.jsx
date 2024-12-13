import React, { useState, useEffect } from 'react';
import axiosConfig from '../../axiosConfig';
import { Link } from 'react-router-dom';
import { IoIosRemoveCircleOutline, IoIosArrowDown } from 'react-icons/io';
import './UserRegistration.css';
import imageCompression from 'browser-image-compression';

const UserRegistration = () => {
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
  const [isFileUploadEnabled, setIsFileUploadEnabled] = useState(false);
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
    'checkbox'
  ];
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });

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
    // Trim the label to remove any whitespace
    const trimmedLabel = newField.label.trim();

    // Validation checks
    if (!trimmedLabel) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Field label cannot be empty.'
      });
      return;
    }

    // Check if field type is selected
    if (!newField.type) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please choose a field type.'
      });
      return;
    }

    // Check if the field label already exists
    const isDuplicateField = allFormFields.some(
      (field) => field.label.toLowerCase() === trimmedLabel.toLowerCase()
    );

    if (isDuplicateField) {
      setNotification({
        show: true,
        type: 'error',
        message: 'A field with this label already exists. Please choose a different label.'
      });
      return;
    }

    // Validate options for select, radio, and checkbox types
    if (['dropdown', 'radio', 'checkbox'].includes(newField.type)) {
      if (newField.options.length === 0) {
        setNotification({
          show: true,
          type: 'error',
          message: `Please add at least one option for ${newField.type} field type.`
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
          options: [] 
        });
        setOptionInput(''); // Clear option input
        setNotification({
          show: true,
          type: 'success',
          message: 'Field added successfully!'
        });
      } catch (error) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Failed to add field. Please try again.'
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

    try {
      // Uncomment when backend is ready
      // const response = await axiosConfig.post("/user-register/", formData);
      // console.log("Submit Response:", response.data);

      setFormData({});
      setGeneratedLink('/admin/confirmation');
    } catch (error) {}
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
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all outline-none"
              onChange={handleInputChange}
              disabled // This prevents interaction
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
                      disabled // This prevents interaction
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

  const Notification = () => {
    if (!notification.show) return null;

    const getIcon = () => {
      if (notification.type === 'success') {
        return (
          <div className="w-12 h-12 rounded-full bg-green-100 p-2 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      }
      return (
        <div className="w-12 h-12 rounded-full bg-red-100 p-2 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all animate-modal-enter">
          <div className="p-6">
            <button
              onClick={() =>
                setNotification({ show: false, type: '', message: '' })
              }
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {getIcon()}

            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
              {notification.type === 'success' ? 'Success!' : 'Oops!'}
            </h3>

            <p className="text-center text-gray-600 mb-6">
              {notification.message}
            </p>

            <button
              onClick={() =>
                setNotification({ show: false, type: '', message: '' })
              }
              className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 ${
                notification.type === 'success'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {notification.type === 'success' ? 'Continue' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full  lg:flex-row flex-col gap-8 registration-section-main">
      <Notification />

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="w-full left-sec lg:w-1/2">
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-8">
          <div className="flex justify-between items-center mb-8 header-btn-sec">
            <h2 className="text-2xl font-semibold text-gray-800">
              User Registration
            </h2>
            <button
              onClick={() => setIsFileUploadEnabled(!isFileUploadEnabled)}
              className="up-btn  flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="text-sm">CSV Upload</span>
              <div
                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${
                  isFileUploadEnabled ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                    isFileUploadEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {isFileUploadEnabled ? (
            <div className="space-y-4">
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
                Save Form
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Field Addition Section */}
      <div className="w-full right-sect lg:w-1/2">
        <div className="bg-black rounded-2xl shadow-sm p-5 sm:p-8">
          <h3 className="text-xl font-semibold mb-8 text-white">
            Customize Registration Form
          </h3>
          <div className="bg-white rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Label
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
                Field Type
              </label>
              <div className="relative">
                <select
                  value={newField.type}
                  onChange={(e) => {
                    setNewField({ 
                      ...newField, 
                      type: e.target.value,
                      options: [] 
                    });
                    setOptionInput('');
                  }}
                  className="w-full p-3 pr-10 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all appearance-none"
                >
                  <option value="" disabled>Choose field type</option>
                  {fieldTypes.map((type) => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
                <IoIosArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
    </div>
  );
};

export default UserRegistration;
