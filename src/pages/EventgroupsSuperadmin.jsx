import React from 'react'
import Navcomponent from '../Components/Navcomponent'
import { IoAddOutline } from "react-icons/io5";

const EventgroupsSuperadmin = () => {
  return (
    <div className='w-full min-h-screen bg-[#f7fafc] overflow-x-hidden'>
        <Navcomponent/>

       <div className="main-content-sec w-full p-10">
            <div className="top-sec w-full flex items-center justify-between bg-red-300">
                <h1 className='text-xl lg:text-[2rem] font-semibold'>Event Groups</h1>
                <button className='px-3 py-2 bg-black text-white flex items-center gap-3 rounded-md'><IoAddOutline  className='text-white'/> Add Event Group</button>
            </div>

            <div className="search-component">
                <input type="text" placeholder="Search..." className="w-[30vw] mt-10 px-3 py-2 text-gray-600 border-2 rounded-full focus:outline-none"/>
            </div>
       </div>
    </div>
  )
}

export default EventgroupsSuperadmin