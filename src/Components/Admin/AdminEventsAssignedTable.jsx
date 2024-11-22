import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import '../Superadmin/TableComponent.css';

const AdminEventsAssignedTable = () => {
  
  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-4 mt-10 events-table-main">
      <div className="relative overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-gray-800">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Event Name</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Start Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">End Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Venue</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Role</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Event Status</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              
                <tr  className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-6 text-black whitespace-nowrap"></td>
                  <td className="px-6 py-6 text-black whitespace-nowrap"></td>
                  <td className="px-6 py-6 text-black whitespace-nowrap"></td>
                  <td className="px-6 py-6 text-black whitespace-nowrap"></td>
                  <td className="px-6 py-6 text-black whitespace-nowrap"></td>
                  <td className="px-6 py-6 text-black whitespace-nowrap"></td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">
                  
                      <button
                        onClick={() => handleRemove()}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                      >
                        Remove
                      </button>
                    
                      <button className="px-4 py-2 bg-blue-500 text-white rounded">Scan Report</button>
                  
                  </td>
                </tr>
             
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEventsAssignedTable;
