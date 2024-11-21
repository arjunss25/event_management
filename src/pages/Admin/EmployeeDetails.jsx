import React from 'react'
import EmployeeDetailsTable from '../../Components/Admin/EmployeeDetailsTable'
import { IoAddOutline} from 'react-icons/io5';

const EmployeeDetails = () => {
  return (
    <div className=' w-full overflow-hidden'>
      <div className="top-sec w-full flex flex-col md:flex-row items-start md:items-center justify-between">
        <h1 className="text-[1.5rem] sm:text-[2rem] font-semibold mb-2 md:mb-0">Employee</h1>
        <button className="px-3 py-2 bg-black text-white flex items-center gap-2 rounded-md text-sm md:text-base">
          <IoAddOutline className="text-white" /> Add Employee
        </button>
      </div>


        <div className="table-component mt-10">
        <EmployeeDetailsTable/>
        </div>
    </div>
  )
}

export default EmployeeDetails