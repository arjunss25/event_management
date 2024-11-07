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
    <div className='w-full p-4 lg:p-6 bg-white'>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className='text-xl lg:text-2xl font-semibold text-gray-900'>Events Overview</h1>

        <div className="mt-4 sm:mt-0">
          {/* <select
            value={selectedYear}
            onChange={handleYearChange}
            className="block w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select> */}
        </div>
      </div>

      <div className="w-full">
        <SuperadminChart />
      </div>
    </div>
  );
};

export default React.memo(Superadmingraph);
