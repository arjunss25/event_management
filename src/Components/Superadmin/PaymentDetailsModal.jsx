import React from 'react';
import { IoClose } from "react-icons/io5";
import { IoCashOutline } from "react-icons/io5";

const PaymentDetailsModal = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[60vw] ml-[300px]  p-6">
        {/* Top section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Payment Details</h1>
          <IoClose className="text-3xl cursor-pointer" />
        </div>

        {/* box-section */}
      <div className="box-section w-full h-[30vh] bg-blue-200">
        <div className="box-main w-[25rem] border-[2px] border-black rounded-[1.2rem]">
          <div className="top w-full p-2 flex justify-end">
            <div className="icon-bg p-2 bg-yellow-200 w-fit rounded-[0.5rem]">
              <IoCashOutline className='text-[1.5rem]' />
            </div>
          </div>

          <div className="btm-section w-full p-3 flex flex-col">
            <h2 className='text-[1rem]'>Total Amount</h2>
            <h2 className='text-[2rem] font-bold'>25000</h2>
          </div>
        </div>
      </div>

        {/* Payment History */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">Payment History</h2>
          <div className="border-t border-gray-200 py-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-500">04-11-2024</p>
              <p>1500</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-500">04-11-2024</p>
              <p>1500</p>
            </div>
            <button className="mt-4 bg-black text-white px-4 py-2 rounded-md">
              Add Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;