import React, { useState } from 'react';
// import { ChevronDown } from 'lucide-react';

const UserRegistration = () => {
  // State for form fields
  const [formFields, setFormFields] = useState([
    { id: 1, label: 'Full Name', type: 'text', placeholder: 'Name' },
    { id: 2, label: 'Email Address', type: 'email', placeholder: 'e-mail' },
    { id: 3, label: 'Phone Number', type: 'tel', placeholder: 'phone number' }
  ]);

  // State for new field form
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    placeholder: ''
  });

  // State for file upload toggle
  const [isFileUploadEnabled, setIsFileUploadEnabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Field type options
  const fieldTypes = [
    'text',
    'email',
    'tel',
    'number',
    'date',
    'select',
    'textarea'
  ];

  // Handle adding new field
  const handleAddField = () => {
    if (newField.label && newField.type && newField.placeholder) {
      setFormFields([
        ...formFields,
        {
          id: formFields.length + 1,
          ...newField
        }
      ]);
      setNewField({ label: '', type: 'text', placeholder: '' });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would handle the form submission
    console.log('Form submitted');
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please upload a CSV file');
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-1/2 p-8">
        <h2 className="text-2xl font-semibold mb-6">User Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={field.placeholder}
                >
                  <option value="">Select an option</option>
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Generate
          </button>

          <div className="pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Upload Registration Details</span>
              <button
                type="button"
                onClick={() => setIsFileUploadEnabled(!isFileUploadEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                  isFileUploadEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                    isFileUploadEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {isFileUploadEnabled && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Upload user details</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-gray-200 file:text-gray-700
                    hover:file:bg-gray-300"
                />
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Generate
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Right side - Field Addition */}
      <div className="w-1/2 bg-gray-800 p-8">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Add Input Fields</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Field Label</label>
              <input
                type="text"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Field Label"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Field Type</label>
              <div className="relative">
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
                >
                  {fieldTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {/* <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /> */}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Placeholder</label>
              <input
                type="text"
                value={newField.placeholder}
                onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Placeholder"
              />
            </div>
            <button
              type="button"
              onClick={handleAddField}
              className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Add Field
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;

