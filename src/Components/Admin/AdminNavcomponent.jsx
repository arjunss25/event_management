import React from 'react'
import { IoMdNotificationsOutline } from "react-icons/io";
const AdminNavcomponent = () => {
  return (
    <div className='w-full font-bold h-[8vh] flex items-center justify-end gap-5 p-10 '>

      {/* notification */}
      <div className="relative ">
        <a href=" " className='text-[2rem] text-[#636e72] hover:text-black'><IoMdNotificationsOutline /></a>
        <h2 className='absolute top-[-0.3rem] right-[-0.1em] min-w-[1rem] h-4 px-[0.3rem] text-[0.8rem] rounded-full bg-[#98FFE0] flex items-center justify-center text-light'>
          3
        </h2>
      </div>

      {/* profile-icon */}
      <div className="profile-icon w-8 h-8 rounded-full border-[1px] border-[#636e72] flex items-center justify-center">
        <img className='w-[1rem]' src="/Neurocode.png" alt="" />
      </div>
    </div>
  )
}

export default AdminNavcomponent