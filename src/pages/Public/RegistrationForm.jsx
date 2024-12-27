import React, { useState, useEffect } from 'react';
import axiosConfig from '../../axiosConfig';

const RegistrationForm = () => {
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const response = await axiosConfig.get('/add-user-extrafield/');
        const fieldsData = response.data?.data?.extra_fields || [];

        // Add default fields
        const allFields = [
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
          ...fieldsData.map((field, index) => ({
            id: `extra-${index}`,
            label: field.fields_name,
            type: field.fields_type,
            placeholder: field.placeholder || field.fields_name,
            options: field.field_option ? Object.values(field.field_option) : [],
          }))
        ];

        setFormFields(allFields);
      } catch (error) {
        console.error('Error fetching form fields:', error);
      }
    };

    fetchFormFields();
  }, []);

  const handleInputChange = (id, value) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simplified payload matching the working Postman request
    const payload = {
      full_name: formData[1],
      email: formData[2]
    };

    try {
      const response = await axiosConfig.post('/user-registration/', payload);
      if (response.data.status === "Success") {
        alert('Registration successful!');
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const renderField = (field) => {
    const baseInputStyles = `
      w-full p-4 bg-white border-2 border-gray-200 rounded-2xl
      focus:border-black transition-all duration-200 outline-none 
      text-black placeholder-gray-400 hover:border-gray-300
    `;

    switch (field.type) {
      case 'dropdown':
        return (
          <select
            name={field.id}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${baseInputStyles} appearance-none`}
            required
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3 p-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required
                  className="w-5 h-5 text-black focus:ring-black border-gray-300"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3 p-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={field.id}
                  value={option}
                  onChange={(e) => {
                    const values = formData[field.id] || [];
                    const newValues = e.target.checked
                      ? [...values, option]
                      : values.filter(v => v !== option);
                    handleInputChange(field.id, newValues);
                  }}
                  className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            name={field.id}
            placeholder={field.placeholder}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required
            className={baseInputStyles}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 md:p-12">
        <h2 className="text-4xl sm:text-5xl font-bold text-black mb-3 tracking-tight">
          Registartion
        </h2>
        <div className="w-20 h-1 bg-black mb-10"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.map((field) => (
              <div key={field.id} className="space-y-2 group">
                <label className="block text-sm uppercase tracking-wider text-gray-600 transition-colors group-focus-within:text-black">
                  {field.label}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  {renderField(field)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4 mt-10">
            <button
              type="button"
              className="px-8 py-4 border-2 border-black text-black rounded-full 
              hover:bg-black hover:text-white transition-all duration-200 
              text-sm uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-black text-white rounded-full 
              hover:bg-gray-800 transition-all duration-200 
              text-sm uppercase tracking-wider"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm; 