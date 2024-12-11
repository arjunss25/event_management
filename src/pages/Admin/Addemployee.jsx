import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosConfig';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    extra_fields: {},
  });
  const [positions, setPositions] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    position: '',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [positionsResponse, extraFieldsResponse] = await Promise.all([
          axiosInstance.get('/position-choices/'),
          axiosInstance.get('/add-employee-extrafields/'),
        ]);

        const positionsData = positionsResponse.data;
        if (positionsData) {
          const formattedPositions = Array.isArray(positionsData.data)
            ? positionsData.data
            : Array.isArray(positionsData)
            ? positionsData
            : Object.entries(positionsData).map(([value, label]) => ({
                value: value,
                label: label,
              }));
          setPositions(formattedPositions);
        }

        const extraFieldsData = extraFieldsResponse.data;
        if (
          extraFieldsData?.status === 'Success' &&
          extraFieldsData?.data?.extra_fields
        ) {
          setExtraFields(extraFieldsData.data.extra_fields);

          const initialExtraFields = {};
          extraFieldsData.data.extra_fields.forEach((field) => {
            initialExtraFields[field.field_name] = '';
          });

          setFormData((prev) => ({
            ...prev,
            extra_fields: initialExtraFields,
          }));
        }
      } catch (error) {
        setError('Failed to load form data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;

  
    if (name === 'name') {
  
      if (!/^[A-Za-z\s]*$/.test(value)) {
        return;
      }
    }

    if (name === 'position') {
      // Find the selected position
      const selectedPosition = positions.find(
        (p) => p.value === value || p.id === value
      );

      // Get the position name/label
      const positionName = selectedPosition
        ? selectedPosition.label ||
          selectedPosition.name ||
          selectedPosition.value
        : value;

      setFormData((prev) => ({
        ...prev,
        [name]: positionName, // Store the position name instead of ID
      }));
    } else if (extraFields.some((field) => field.field_name === name)) {
      setFormData((prev) => ({
        ...prev,
        extra_fields: {
          ...prev.extra_fields,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  // Modified to store single value instead of array
  const handleCheckboxChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      extra_fields: {
        ...prev.extra_fields,
        [fieldName]: value,
      },
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      address: '',
      position: '',
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    } else if (formData.address.length < 5) {
      newErrors.address = 'Address must be at least 5 characters long';
      isValid = false;
    }

    // Position validation
    if (!formData.position) {
      newErrors.position = 'Please select a position';
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Perform validation before submission
    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const defaultPassword = `${formData.name
        .replace(/\s+/g, '')
        .toLowerCase()}@123`;

      let firebaseUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          defaultPassword
        );
        firebaseUser = userCredential.user;
      } catch (firebaseError) {

        // Handle specific Firebase errors
        if (firebaseError.code === 'auth/email-already-in-use') {
          throw new Error('An account with this email already exists.');
        } else if (firebaseError.code === 'auth/invalid-email') {
          throw new Error('The email address is not valid.');
        } else if (firebaseError.code === 'auth/operation-not-allowed') {
          throw new Error(
            'Email/password accounts are not enabled. Please contact support.'
          );
        } else if (firebaseError.code === 'auth/weak-password') {
          throw new Error('The password is too weak.');
        }
        throw firebaseError;
      }

      // Prepare and send data to backend
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        position: formData.position,
        extra_fields: formData.extra_fields,
        firebase_uid: firebaseUser.uid,
      };


      const response = await axiosInstance.post('/register-employee/', payload);

      if (response.data?.status === 'Success') {
        navigate('/admin/employee-details');
      } else {
        // If backend registration fails, delete the Firebase user
        if (firebaseUser) {
          try {
            await firebaseUser.delete();
          } catch (deleteError) {

          }
        }
        throw new Error(
          response.data?.message || 'Failed to register employee'
        );
      }
    } catch (error) {


      // Set appropriate error message
      if (error.response) {
        setError(
          error.response.data.error ||
            error.response.data.message ||
            'Failed to register employee'
        );
      } else if (error.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(
          error.message || 'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderExtraField = (field) => {
    const commonInputClasses =
      'w-full px-3 py-2 border rounded-3xl border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500';

    switch (field.field_type?.toLowerCase()) {
      case 'text':
        return (
          <input
            type="text"
            id={field.field_name}
            name={field.field_name}
            value={formData.extra_fields[field.field_name] || ''}
            onChange={handleChange}
            className={commonInputClasses}
            placeholder={`Enter ${field.field_name}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.field_name}
            name={field.field_name}
            value={formData.extra_fields[field.field_name] || ''}
            onChange={handleChange}
            className={commonInputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.field_name}
            name={field.field_name}
            value={formData.extra_fields[field.field_name] || ''}
            onChange={handleChange}
            className={commonInputClasses}
            placeholder="0"
          />
        );

      case 'dropdown':
      case 'option':
        return (
          <div className="relative">
            <select
              id={field.field_name}
              name={field.field_name}
              value={formData.extra_fields[field.field_name] || ''}
              onChange={handleChange}
              className={`${commonInputClasses} pr-10 appearance-none`}
            >
              <option value="">Select {field.field_name}</option>
              {Object.entries(field.field_option || {}).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {Object.entries(field.field_option || {}).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center group cursor-pointer"
              >
                <div className="relative">
                  <input
                    type="radio"
                    id={`${field.field_name}-${key}`}
                    name={field.field_name}
                    value={value}
                    checked={formData.extra_fields[field.field_name] === value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-purple-500 transition-colors">
                    <div
                      className={`
                      w-3 h-3 m-0.5 rounded-full transition-all
                      ${
                        formData.extra_fields[field.field_name] === value
                          ? 'bg-purple-600 scale-100'
                          : 'bg-transparent scale-0'
                      }
                    `}
                    />
                  </div>
                </div>
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                  {value}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {Object.entries(field.field_option || {}).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center group cursor-pointer"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    id={`${field.field_name}-${key}`}
                    name={field.field_name}
                    value={value}
                    checked={formData.extra_fields[field.field_name] === value}
                    onChange={() =>
                      handleCheckboxChange(field.field_name, value)
                    }
                    className="sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-purple-500 transition-colors">
                    <div
                      className={`
                          w-3 h-3 m-0.5 rounded transition-all
                          ${
                            formData.extra_fields[field.field_name] === value
                              ? 'bg-purple-600 scale-100'
                              : 'bg-transparent scale-0'
                          }
                        `}
                    />
                  </div>
                </div>
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                  {value}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full  flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="w-full p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add Employee</h1>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-2xl">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields remain the same */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              {fieldErrors.name && (
                <p className="text-sm text-red-500 mb-1">{fieldErrors.name}</p>
              )}
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-3xl ${
                  fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                placeholder="Name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                e-mail
              </label>
              {fieldErrors.email && (
                <p className="text-sm text-red-500 mb-1">{fieldErrors.email}</p>
              )}
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-3xl ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone
              </label>
              {fieldErrors.phone && (
                <p className="text-sm text-red-500 mb-1">{fieldErrors.phone}</p>
              )}
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-3xl ${
                  fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                placeholder="Enter your 10-digit phone number"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              {fieldErrors.address && (
                <p className="text-sm text-red-500 mb-1">{fieldErrors.address}</p>
              )}
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-3xl ${
                  fieldErrors.address ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                placeholder="Enter address"
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Position
              </label>
              {fieldErrors.position && (
                <p className="text-sm text-red-500 mb-1">{fieldErrors.position}</p>
              )}
              <div className="relative">
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-3xl appearance-none ${
                    fieldErrors.position ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                >
                  <option value="">Select Position</option>
                  {positions.map((position) => (
                    <option
                      key={position.value || position.id}
                      value={position.label || position.name || position.value}
                    >
                      {position.label || position.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Extra fields */}
            {extraFields.map((field) => (
              <div key={field.field_name}>
                <label
                  htmlFor={field.field_name}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.field_name}
                  {field.is_required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {renderExtraField(field)}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-16">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              onClick={() => {
                navigate('/admin/employee-details');
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
