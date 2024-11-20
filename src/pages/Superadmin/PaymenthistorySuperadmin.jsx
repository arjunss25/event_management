import React from 'react';
import EventsTable from '../../Components/Superadmin/TableComponent';

const PaymenthistorySuperadmin = () => {
  return (
    <div className="w-full min-h-screen bg-[#f7fafc] overflow-x-hidden">
      

      <div className="main-content-sec w-full p-4 md:p-6 lg:p-10">
        {/* Top Section */}
        <div className="top-sec w-full flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-[1.5rem] sm:text-[2rem] font-semibold mb-2 md:mb-0">
            Payment History
          </h1>
        </div>

        {/* Table Section */}
        <div className="table-section mt-6 overflow-x-auto w-full ">
          <EventsTable />
        </div>
      </div>
    </div>
  );
};

export default PaymenthistorySuperadmin;
