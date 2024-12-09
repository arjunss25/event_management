import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          <select
            id={field.field_name}
            name={field.field_name}
            value={formData.extra_fields[field.field_name] || ''}
            onChange={handleChange}
            className={commonInputClasses}
          >
            <option value="">Select {field.field_name}</option>
            {Object.entries(field.field_option || {}).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
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
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="relative">
            <div className="w-28 h-28 bg-white rounded-full border border-black flex items-center justify-center">
              <span className="text-purple-600 font-semibold">Grip</span>
            </div>
            <div className="absolute bottom-0 right-0 bg-gray-100 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
              <Camera size={16} className="text-gray-600" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields remain the same */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-5"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-3xl border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-5"
              >
                e-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-3xl border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="xyz@gmail.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-5"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-3xl border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="8644566635"
                required
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-5"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-3xl border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Enter address"
                required
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-gray-700 mb-5"
              >
                Position
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-3xl border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
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
            </div>

            {/* Extra fields */}
            {extraFields.map((field) => (
              <div key={field.field_name}>
                <label
                  htmlFor={field.field_name}
                  className="block text-sm font-medium text-gray-700 mb-5"
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
