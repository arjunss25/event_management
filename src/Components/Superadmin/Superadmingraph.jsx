import React from 'react'
import SuperadminChart from './SuperadminChart'

const Superadmingraph = () => {
  return (
    <div className='w-full  p-4 lg:p-6'>
      {/* title */}
      <h1 className='text-xl lg:text-2xl font-semibold mb-6'>Events Overview</h1>

      {/* chart*/}
      <div className="w-full -mx-4 sm:mx-0">
        <SuperadminChart/>
      </div>
    </div>
  )
}

export default Superadmingraph