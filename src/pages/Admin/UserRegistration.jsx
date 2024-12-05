import React, { useState, useEffect } from "react";
import axiosConfig from "../../axiosConfig";
import { Link } from "react-router-dom";
import { IoIosRemoveCircleOutline, IoIosArrowDown } from "react-icons/io";
import "./UserRegistration.css";
 
const UserRegistration = () => {
  const [formFields, setFormFields] = useState([
    { id: 1, label: "Full Name", type: "text", placeholder: "Name", isDefault: true },
    { id: 2, label: "Email Address", type: "email", placeholder: "e-mail", isDefault: true },
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
    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="mb-4">
            <select
              name={field.id}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all outline-none"
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
            <div className="space-y-2">
              {field.options && field.options.map((option, idx) => (
                <label key={`${field.id}-option-${idx}`} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value || option}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-black border-gray-300 focus:ring-gray-200"
                  />
                  <span className="text-gray-700">{option.value || option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <div className="space-y-2">
              {field.options && field.options.map((option, idx) => (
                <label key={`${field.id}-option-${idx}`} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={field.id}
                    value={option.value || option}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-black rounded border-gray-300 focus:ring-gray-200"
                  />
                  <span className="text-gray-700">{option.value || option}</span>
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
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all outline-none"
            />
          </div>
        );
    }
  };
 
  return (
    <div className="flex w-full  lg:flex-row flex-col gap-8 registration-section-main">
      {/* Form Section */}
      <div className="w-full left-sec lg:w-1/2">
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-8">
          <div className="flex justify-between items-center mb-8 header-btn-sec">
            <h2 className="text-2xl font-semibold text-gray-800">User Registration</h2>
            <button
              onClick={() => setIsFileUploadEnabled(!isFileUploadEnabled)}
              className="up-btn  flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="text-sm">CSV Upload</span>
              <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${
                isFileUploadEnabled ? 'bg-black' : 'bg-gray-300'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                  isFileUploadEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
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
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">Click to upload CSV file</span>
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
                  Successfully registered! Click <Link to={generatedLink} className="text-black hover:underline">here</Link> to continue.
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
          <h3 className="text-xl font-semibold mb-8 text-white">Customize Registration Form</h3>
          <div className="bg-white rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
              <input
                type="text"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all"
                placeholder="Enter field label"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
              <div className="relative">
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  className="w-full p-3 pr-10 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all appearance-none"
                >
                  {fieldTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <IoIosArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {["select", "radio", "checkbox"].includes(newField.type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
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
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md">
                          <span className="text-sm text-gray-600">{option}</span>
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