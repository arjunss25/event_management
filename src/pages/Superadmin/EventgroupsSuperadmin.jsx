import React from 'react';
import Navcomponent from '../../Components/Navcomponent';
import { IoAddOutline } from 'react-icons/io5';
import EventgroupsSuperadminTable from '../../Components/Superadmin/EventgroupsSuperadminTable';

const EventgroupsSuperadmin = () => {
  return (
    <div className="w-full min-h-screen bg-[#f7fafc] overflow-x-hidden">
      <Navcomponent />

      <div className="main-content-sec w-full p-4 md:p-6 lg:p-10">
        {/* Top Section */}
        <div className="top-sec w-full flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-[1.5rem] sm:text-[2rem] font-semibold mb-2 md:mb-0">
            Event Groups
          </h1>
          <button className="px-3 py-2 bg-black text-white flex items-center gap-2 rounded-md text-sm md:text-base">
            <IoAddOutline className="text-white" /> Add Event Group
          </button>
        </div>

        {/* Search Component */}
        <div className="search-component w-full flex justify-center md:justify-start mt-6">
          <input
            type="text"
            placeholder="Search..."
            className="w-full md:w-[60%] lg:w-[30%] px-4 py-2 text-gray-600 border-2 rounded-full focus:outline-none"
          />
        </div>

        {/* Table Section */}
        <div className="table-section mt-6 overflow-x-auto">
          <EventgroupsSuperadminTable />
        </div>
      </div>
    </div>
  );
};

export default EventgroupsSuperadmin;
