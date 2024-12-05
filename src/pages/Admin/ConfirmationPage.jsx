import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig"; // Update the path to match your project structure

const ConfirmationPage = () => {
  const [formFields, setFormFields] = useState([
    { id: "1", label: "Full Name", type: "text", placeholder: "Name", required: true },
    { id: "2", label: "Email Address", type: "email", placeholder: "e-mail", required: true },
    { id: "3", label: "Phone Number", type: "tel", placeholder: "phone number", required: true },
  ]);

  const [fetchedExtraFields, setFetchedExtraFields] = useState([]);
  const [formData, setFormData] = useState({
    "1": "", // Default value for Full Name
    "2": "", // Default value for Email
    "3": "", // Default value for Phone
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchExtraFields = async () => {
      try {
        const response = await axios.get("/add-user-extrafield/");

        const fieldsData = response.data?.data?.extra_fields || [];

        if (!Array.isArray(fieldsData)) {
          console.error("fieldsData is not an array:", fieldsData);
          return;
        }

        const transformedFields = fieldsData.map((field, index) => {
          let processedOptions = [];
          if (field.field_option) {
            if (Array.isArray(field.field_option)) {
              processedOptions = field.field_option;
            } else if (typeof field.field_option === 'object') {
              processedOptions = Object.entries(field.field_option).map(([key, value]) => ({
                id: key,
                value: value,
              }));
            }
          }

          return {
            id: `extra-${index}`,
            label: field.fields_name || '',
            type: field.fields_type || 'text',
            placeholder: field.placeholder || field.fields_name || '',
            options: processedOptions,
            required: field.required || false,
          };
        });

        setFetchedExtraFields(transformedFields);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch extra fields.");
      } finally {
        setLoading(false);
      }
    };

    fetchExtraFields();
  }, []);

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    // Validate predefined fields
    formFields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        errors[field.id] = `${field.label} is required.`;
        isValid = false;
      }
    });

    // Validate dynamic fields
    fetchedExtraFields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        errors[field.id] = `${field.label} is required.`;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare data for submission to match backend structure
      const dataToSubmit = {
        full_name: formData["1"], // Full name from formData
        email: formData["2"], // Email from formData
        phone: formData["3"], // Phone number from formData
        extra_fields: fetchedExtraFields.reduce((acc, field) => {
          if (formData[field.id]) {
            acc[field.label] = formData[field.id];
          }
          return acc;
        }, {}),
      };

      try {
        const response = await axios.post("/user-register/", dataToSubmit); // Replace with your API endpoint
        alert("Form submitted successfully!");
        setFormData({
          "1": "",
          "2": "",
          "3": "",
        });
      } catch (err) {
        alert(err.response?.data?.message || "Failed to submit the form.");
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const renderInputField = (field) => {
    return (
      <div key={field.id} className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {field.label}
        </label>
        {field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "number" || field.type === "date" ? (
          <input
            type={field.type}
            name={field.id} // Ensure this matches the formData key
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        ) : field.type === "radio" ? (
          <div className="flex flex-col space-y-2">
            {field.options.map((option) => (
              <label key={option.id} className="flex items-center">
                <input
                  type="radio"
                  name={field.id} // Ensure this matches the formData key
                  value={option.value} // Use option.value here
                  checked={formData[field.id] === option.value} // Compare against the value
                  onChange={handleInputChange}
                  className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2">{option.value}</span>
              </label>
            ))}
          </div>
        ) : field.type === "select" ? (
          <select
            name={field.id} // Ensure this matches the formData key
            value={formData[field.id] || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select {field.label}</option>
            {field.options.map((option) => (
              <option key={option.id} value={option.value}>
                {option.value} {/* Use option.value here */}
              </option>
            ))}
          </select>
        ) : field.type === "checkbox" ? (
          <div className="flex flex-col space-y-2">
            {field.options.map((option) => (
              <label key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  name={field.id} // Ensure this matches the formData key
                  value={option.value} // Use option.value here
                  checked={formData[field.id]?.includes(option.value) || false} // Compare against the value
                  onChange={(e) => {
                    const updatedValue = [...(formData[field.id] || [])];
                    if (e.target.checked) {
                      updatedValue.push(option.value); // Store the value
                    } else {
                      const index = updatedValue.indexOf(option.value);
                      if (index > -1) {
                        updatedValue.splice(index, 1);
                      }
                    }
                    setFormData((prevData) => ({ ...prevData, [field.id]: updatedValue }));
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2">{option.value}</span>
              </label>
            ))}
          </div>
        ) : null}
  
        {formErrors[field.id] && (
          <p className="text-red-500 text-xs mt-1">{formErrors[field.id]}</p>
        )}
      </div>
    );
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-semibold mb-6">User Registration Form</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md"
      >
        {/* Render predefined fields */}
        {formFields.map((field) => renderInputField(field))}

        {/* Render fetched dynamic fields */}
        {fetchedExtraFields.map((field) => renderInputField(field))}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ConfirmationPage;
