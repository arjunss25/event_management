import React from 'react';
import { IoClose } from "react-icons/io5";
import { IoCashOutline } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";

const PaymentDetailsModal = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[60vw]  py-10 px-10">
        {/* Top section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Payment Details</h1>
          <IoClose className="text-3xl cursor-pointer" />
        </div>

        {/* box-section */}
      <div className="box-section w-full h-[22vh]  flex gap-5">


        <div className="box-main w-[25rem] border-[2px] border-black rounded-[1.2rem]">
          <div className="top w-full p-2 flex justify-end">
            <div className="icon-bg p-2 bg-[#f0f3f5] w-fit rounded-[0.5rem]">
              <IoCashOutline className='text-[1.5rem]' />
            </div>
          </div>

          <div className="btm-section w-full p-3 flex flex-col">
            <h2 className='text-[1rem]'>Total Amount</h2>
            <h2 className='text-[2rem] font-bold'>25000</h2>
          </div>
        </div>



        <div className="box-main w-[25rem] border-[2px] border-black rounded-[1.2rem]">
          <div className="top w-full p-2 flex justify-end">
            <div className="icon-bg p-2 bg-[#f0f3f5] w-fit rounded-[0.5rem]">
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
          <div className="top-section flex justify-between items-center w-full mb-5">
          <h2 className=" font-medium text-[1.2rem] font-">Payment History</h2>
          <button className=" bg-black text-white px-4 py-2 rounded-md text-[0.9rem]">
              Add Payment
          </button>
          </div>
          <div className="border-t border-gray-200 ">
            <div className="flex justify-start gap-32 items-center p-5 border-b-[1px] border-gray-200">
              <FaCheckCircle className='text-green-600'/>
              <div className="date-sec">
                <h1>Date</h1>
                <p className="text-gray-500">04-11-2024</p>
              </div>
              <div className="payment-section">
              <h1>Amount</h1>
              <p>1500</p>
              </div>
            </div>

            <div className="flex justify-start gap-32 items-center p-5 border-b-[1px] border-gray-200">
              <FaCheckCircle className='text-green-600'/>
              <div className="date-sec">
                <h1>Date</h1>
                <p className="text-gray-500">04-11-2024</p>
              </div>
              <div className="payment-section">
              <h1>Amount</h1>
              <p>1500</p>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;