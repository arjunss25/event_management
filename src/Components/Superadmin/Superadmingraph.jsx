import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SuperadminChart from './SuperadminChart';
// import { setSelectedYear, getChartData, selectChartMetadata } from '../../Redux/Slices/SuperAdmin/chartSlice';

const Superadmingraph = () => {
  // const dispatch = useDispatch();
  // const { selectedYear, availableYears } = useSelector(selectChartMetadata);

  // const handleYearChange = useCallback((event) => {
  //   const year = event.target.value;
  //   dispatch(setSelectedYear(year));
  //   console.log(`Year changed to: ${year}`);
  //   dispatch(getChartData(year)); // Fetch data for the selected year
  // }, [dispatch]);

  // useEffect(() => {
  //   console.log(`Initial data fetch for year: ${selectedYear}`);
  //   dispatch(getChartData(selectedYear));
  // }, [dispatch, selectedYear]);

  return (
    <div className='w-full p-4 lg:p-6 bg-white h-[70vh] mb-10  flex  justify-center'>
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className='text-xl lg:text-2xl font-semibold text-gray-900'>Events Overview</h1>

        <div className="mt-4 sm:mt-0">
          
        </div>
      </div> */}

      <div className="w-full  ">
        <SuperadminChart />
      </div>
    </div>
  );
};

export default React.memo(Superadmingraph);
