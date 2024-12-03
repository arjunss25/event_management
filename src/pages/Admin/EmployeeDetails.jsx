import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDetailsTable from '../../Components/Admin/EmployeeDetailsTable';
import { IoAddOutline } from 'react-icons/io5';

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddEmployee = () => {
    navigate('/admin/add-employee');
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="top-sec w-full flex flex-col md:flex-row items-start md:items-center justify-between">
        <h1 className="text-[1.5rem] sm:text-[2rem] font-semibold mb-2 md:mb-0">
          Employee
        </h1>
        <button
          onClick={handleAddEmployee}
          className="px-3 py-2 bg-black text-white flex items-center gap-2 rounded-md text-sm md:text-base"
        >
          <IoAddOutline className="text-white" /> Add Employee
        </button>
      </div>

      <div className="table-component mt-10">
        <EmployeeDetailsTable />
      </div>
    </div>
  );
};

export default EmployeeDetails;
