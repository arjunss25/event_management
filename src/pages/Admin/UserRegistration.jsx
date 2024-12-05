import React, { useState, useEffect } from "react";
import axiosConfig from "../../axiosConfig";
import { Link } from "react-router-dom";
 
const UserRegistration = () => {
  const [formFields, setFormFields] = useState([
    { id: 1, label: "Full Name", type: "text", placeholder: "Name" },
    { id: 2, label: "Email Address", type: "email", placeholder: "e-mail" },
    { id: 3, label: "Phone Number", type: "tel", placeholder: "phone number" },
  ]);
  const [fetchedExtraFields, setFetchedExtraFields] = useState([]);
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
    placeholder: "",
    options: [],
  });
 
  const [formData, setFormData] = useState({});
  const [optionInput, setOptionInput] = useState("");
  const [isFileUploadEnabled, setIsFileUploadEnabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const fieldTypes = ["text", "email", "tel", "number", "date", "select", "radio", "checkbox"];
 
  useEffect(() => {
    const fetchExtraFields = async () => {
      try {
        const response = await axiosConfig.get("/add-user-extrafield/");
        console.log("Complete Response Object:", response);
       
        const fieldsData = response.data?.data?.extra_fields || [];
        console.log("Fields Data before transformation:", fieldsData);
 
        if (!Array.isArray(fieldsData)) {
          console.error("fieldsData is not an array:", fieldsData);
          return;
        }
 
        const transformedFields = fieldsData.map((field, index) => {
          console.log("Processing field:", field);
          let processedOptions = [];
         
          if (field.field_option) {
            if (Array.isArray(field.field_option)) {
              processedOptions = field.field_option;
            } else if (typeof field.field_option === 'object') {
              processedOptions = Object.entries(field.field_option).map(([key, value]) => ({
                id: key,
                value: value
              }));
            }
          }
 
          return {
            id: `extra-${index}`,
            label: field.fields_name || '',
            type: field.fields_type || 'text',
            placeholder: field.placeholder || field.fields_name || '',
            options: processedOptions
          };
        });
 
        console.log("Final Transformed Fields:", transformedFields);
        setFetchedExtraFields(transformedFields);
      } catch (error) {
        console.error("Error fetching extra fields:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response,
          data: error.response?.data
        });
      }
    };
 
    fetchExtraFields();
  }, []);
 
  // Combine initial and fetched fields
  const allFormFields = [...formFields, ...fetchedExtraFields];
  console.log("All Form Fields:", allFormFields);
 
  const handleInputChange = (id, value) => {
    setFormData({ ...formData, [id]: value });
  };
 
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
 
  const handleAddField = async () => {
    if (newField.label && newField.type) {
      const fieldData = {
        fields_name: newField.label,
        fields_type: newField.type,
        field_option: newField.options.reduce(
          (acc, option, index) => ({ ...acc, [`option${index + 1}`]: option }),
          {}
        ),
      };
 
      try {
        const response = await axiosConfig.post("/add-user-extrafield/", fieldData);
        console.log("Add Field Response:", response.data);
 
        const newFieldToAdd = {
          id: `extra-${fetchedExtraFields.length}`,
          label: newField.label,
          type: newField.type,
          placeholder: newField.label,
          options: newField.options
        };
 
        setFetchedExtraFields([...fetchedExtraFields, newFieldToAdd]);
        setNewField({ label: "", type: "text", placeholder: "", options: [] });
        alert("Field added successfully!");
      } catch (error) {
        console.error("Error adding field:", error);
        alert("Failed to add field. Please try again.");
      }
    }
  };
 
  const handleDeleteField = async (label) => {
    try {
      console.log(`Attempting to delete field with label: ${label}`); // Log the label value for debugging
  
      // Check if the label is valid (ensure it exists)
      if (!label) {
        alert("Invalid field label.");
        return;
      }
  
      // Attempt to delete the field from the backend
      const response = await axiosConfig.delete(`/delete-user-fields/${label}`);
  
      if (response.status === 200) {
        // Remove the deleted field from the local state
        setFetchedExtraFields(fetchedExtraFields.filter((field) => field.label !== label));
  
        // Optionally, update form data to remove the deleted field
        const updatedFormData = { ...formData };
        delete updatedFormData[label];
        setFormData(updatedFormData);
  
        alert("Field deleted successfully!");
      } else {
        alert("Failed to delete field: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting field:", error);
      alert("Failed to delete field. Please try again.");
    }
  };
  
  
  
  
  
 
  const handleAddOption = () => {
    if (optionInput.trim()) {
      setNewField({
        ...newField,
        options: [...newField.options, optionInput.trim()],
      });
      setOptionInput("");
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
    console.log("Form Data being sent:", formData);
    try {
      // Uncomment when backend is ready
      // const response = await axiosConfig.post("/user-register/", formData);
      // console.log("Submit Response:", response.data);
      alert("Form submitted successfully!");
      setFormData({});
      setGeneratedLink("/admin/confirmation");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    }
  };
 
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }
 
    const fileData = new FormData();
    fileData.append('file', selectedFile);
 
    try {
      setLoading(true);
      const response = await axiosConfig.post('/csv-registration/', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('File Upload Response:', response.data);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('File Upload Error:', error);
      alert(error.response?.data?.message || 'Failed to upload the file.');
    } finally {
      setLoading(false);
    }
  };
 
  const renderInputField = (field) => {
    console.log("Rendering field:", field);
   
    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="mb-4">
            {/* <label className="block text-gray-700 text-sm font-bold mb-2">
              {field.label}
            </label> */}
            <select
              name={field.id}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={handleInputChange}
            >
              <option value="">Select {field.label}</option>
              {field.options && field.options.map((option, idx) => (
                <option key={`${field.id}-option-${idx}`} value={option.value || option}>
                  {option.value || option}
                </option>
              ))}
            </select>
          </div>
        );
 
      case 'radio':
        return (
          <div key={field.id} className="mb-4">
            {/* <label className="block text-gray-700 text-sm font-bold mb-2">
              {field.label}
            </label> */}
            <div className="mt-2">
              {field.options && field.options.map((option, idx) => (
                <label key={`${field.id}-option-${idx}`} className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value || option}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{option.value || option}</span>
                </label>
              ))}
            </div>
          </div>
        );
 
      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            {/* <label className="block text-gray-700 text-sm font-bold mb-2">
              {field.label}
            </label> */}
            <div className="mt-2">
              {field.options && field.options.map((option, idx) => (
                <label key={`${field.id}-option-${idx}`} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    name={field.id}
                    value={option.value || option}
                    onChange={handleInputChange}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{option.value || option}</span>
                </label>
              ))}
            </div>
          </div>
        );
 
      default:
        return (
          <div key={field.id} className="mb-4">
            {/* <label className="block text-gray-700 text-sm font-bold mb-2">
              {field.label}
            </label> */}
            <input
              type={field.type}
              name={field.id}
              placeholder={field.placeholder}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        );
    }
  };
 
  return (
    <div className="flex min-h-screen bg-white">
      {/* Form Section */}
      <div className="w-1/2 p-8">
        <h2 className="text-2xl font-semibold mb-6">User Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {allFormFields.map((field) => (
            <div key={field.id} className="space-y-2 relative">
              {/* <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label> */}
              {renderInputField(field)}
{field.label && (
  <button
    type="button"
    onClick={() => handleDeleteField(field.label)}
    className="absolute top-0 right-0 text-red-500"
  >
    &#x2715;
  </button>
)}

 
            </div>
          ))}
          <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md">
            Submit Form
          </button>
        </form>
 
        {/* File Upload Section */}
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Upload Registration Details</span>
            <button
              type="button"
              onClick={() => setIsFileUploadEnabled(!isFileUploadEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                isFileUploadEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              aria-pressed={isFileUploadEnabled}
              aria-label="Toggle file upload section"
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
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">Selected File: {selectedFile.name}</p>
              )}
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={loading}
                className={`w-full px-4 py-2 rounded-md transition-colors duration-200 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          )}
        </div>
 
        {/* Display generated link */}
        {generatedLink && (
          <div className="pt-4">
            <Link to={generatedLink} className="text-blue-600 hover:text-blue-800">
              Go to Confirmation Page
            </Link>
          </div>
        )}
      </div>
 
      {/* Field Addition Section */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Field Type</label>
              <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {fieldTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {["select", "radio", "checkbox"].includes(newField.type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Options</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Option value"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1 mt-2">
                  {newField.options.map((option, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{option}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500"
                      >
                        &#x2715;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleAddField}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
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