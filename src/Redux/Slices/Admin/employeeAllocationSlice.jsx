import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig';

// Add new thunk for fetching allocated employees with empty list handling
export const fetchAllocatedEmployees = createAsyncThunk(
  'employeeAllocation/fetchAllocatedEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/allocated-employee-list/');
      // Check if data exists and has length
      if (!response.data?.data || response.data.data.length === 0) {
        return [];
      }
      
      const allocatedEmployees = response.data.data.reduce((acc, employee) => {
        // Check if employee has required fields
        if (!employee?.position || !employee?.name || !employee?.id) {
          return acc;
        }
        
        const section = acc.find(s => s.position === employee.position);
        const employeeData = {
          id: employee.id,
          name: employee.name
        };
        
        if (section) {
          section.employees.push(employeeData);
        } else {
          acc.push({
            position: employee.position,
            employees: [employeeData]
          });
        }
        return acc;
      }, []);
      
      return allocatedEmployees;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch allocated employees'
      });
    }
  }
);

// Existing thunks
export const removeEmployeePosition = createAsyncThunk(
  'employeeAllocation/removeEmployeePosition',
  async (positionName, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/remove-employee-position/${positionName}/`);
      return positionName;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to remove position',
        positionName
      });
    }
  }
);

export const fetchPositions = createAsyncThunk(
  'employeeAllocation/fetchPositions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/list-positions-for-allocation/');
      if (!response.data?.data?.[0]) {
        return [];
      }
      const positions = Object.entries(response.data.data[0]).map(([key, value]) => ({
        id: key,
        name: value
      }));
      return positions;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch positions'
      });
    }
  }
);

export const fetchEmployeesByPosition = createAsyncThunk(
  'employeeAllocation/fetchEmployeesByPosition',
  async (position, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/employees-position/${position}/`);
      return response.data?.data || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch employees',
        status: error.response?.status
      });
    }
  }
);

export const addEmployeeToAllocation = createAsyncThunk(
  'employeeAllocation/addEmployeeToAllocation',
  async (employee, { rejectWithValue }) => {
    try {
      const payload = {
        employees: [
          { id: employee.id, name: employee.name }
        ]
      };
      await axiosInstance.post('/employee-allocation/', payload);
      return { employee, success: true };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to add employee',
        employee
      });
    }
  }
);

export const removeEmployeeFromAllocation = createAsyncThunk(
  'employeeAllocation/removeEmployeeFromAllocation',
  async ({ employeeId, positionName, employeeName }, { rejectWithValue }) => {
    try {
      const payload = {
        employees: [
          {
            id: employeeId,
            name: employeeName
          }
        ]
      };

      await axiosInstance.delete('/employee-allocation/', { data: payload });
      return { employeeId, positionName };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to remove employee',
        employeeId,
        positionName
      });
    }
  }
);

const employeeAllocationSlice = createSlice({
  name: 'employeeAllocation',
  initialState: {
    positions: [],
    employees: [],
    allocatedSections: [],
    selectedPosition: '',
    status: 'idle',
    error: null,
    searchTerm: '',
    addingEmployee: false,
    removingEmployee: false,
    removingPosition: false,
    loadingAllocated: false,
  },
  reducers: {
    setSelectedPosition: (state, action) => {
      state.selectedPosition = action.payload;
      state.employees = [];
      if (!state.allocatedSections.find(section => section.position === action.payload)) {
        state.allocatedSections.push({
          position: action.payload,
          employees: []
        });
      }
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Positions cases
      .addCase(fetchPositions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.positions = action.payload;
        state.error = null;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch positions';
        state.positions = [];
      })

      // Fetch Employees by Position cases
      .addCase(fetchEmployeesByPosition.pending, (state) => {
        state.status = 'loading';
        state.employees = [];
      })
      .addCase(fetchEmployeesByPosition.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeesByPosition.rejected, (state, action) => {
        if (action.payload?.status !== 404) {
          state.status = 'failed';
          state.error = action.payload?.message || 'Failed to fetch employees';
        } else {
          state.status = 'succeeded';
          state.error = null;
        }
        state.employees = [];
      })

      // Add Employee cases
      .addCase(addEmployeeToAllocation.pending, (state) => {
        state.addingEmployee = true;
      })
      .addCase(addEmployeeToAllocation.fulfilled, (state, action) => {
        state.addingEmployee = false;
        const sectionIndex = state.allocatedSections.findIndex(
          section => section.position === state.selectedPosition
        );
        if (sectionIndex !== -1) {
          state.allocatedSections[sectionIndex].employees.push(action.payload.employee);
        }
        state.error = null;
      })
      .addCase(addEmployeeToAllocation.rejected, (state, action) => {
        state.addingEmployee = false;
        state.error = action.payload.message;
      })

      // Remove Employee cases
      .addCase(removeEmployeeFromAllocation.pending, (state) => {
        state.removingEmployee = true;
      })
      .addCase(removeEmployeeFromAllocation.fulfilled, (state, action) => {
        state.removingEmployee = false;
        const sectionIndex = state.allocatedSections.findIndex(
          section => section.position === action.payload.positionName
        );
        if (sectionIndex !== -1) {
          state.allocatedSections[sectionIndex].employees =
            state.allocatedSections[sectionIndex].employees.filter(
              emp => emp.id !== action.payload.employeeId
            );
        }
        state.error = null;
      })
      .addCase(removeEmployeeFromAllocation.rejected, (state, action) => {
        state.removingEmployee = false;
        state.error = action.payload.message;
      })

      // Remove Position cases
      .addCase(removeEmployeePosition.pending, (state) => {
        state.removingPosition = true;
      })
      .addCase(removeEmployeePosition.fulfilled, (state, action) => {
        state.removingPosition = false;
        state.allocatedSections = state.allocatedSections.filter(
          section => section.position !== action.payload
        );
        if (state.selectedPosition === action.payload) {
          state.selectedPosition = '';
          state.employees = [];
        }
        state.error = null;
      })
      .addCase(removeEmployeePosition.rejected, (state, action) => {
        state.removingPosition = false;
        state.error = action.payload.message;
      })

      // Fetch Allocated Employees cases
      .addCase(fetchAllocatedEmployees.pending, (state) => {
        state.loadingAllocated = true;
      })
      .addCase(fetchAllocatedEmployees.fulfilled, (state, action) => {
        state.loadingAllocated = false;
        state.allocatedSections = action.payload;
        state.error = null;
      })
      .addCase(fetchAllocatedEmployees.rejected, (state, action) => {
        state.loadingAllocated = false;
        state.error = action.payload?.message || 'Failed to fetch allocated employees';
        state.allocatedSections = [];
      });
  }
});

export const {
  setSelectedPosition,
  setSearchTerm,
  clearError
} = employeeAllocationSlice.actions;

// Selectors
export const selectPositions = (state) => state.adminEmployeeAllocation.positions;
export const selectEmployees = (state) => state.adminEmployeeAllocation.employees;
export const selectAllocatedSections = (state) => state.adminEmployeeAllocation.allocatedSections;
export const selectSelectedPosition = (state) => state.adminEmployeeAllocation.selectedPosition;
export const selectStatus = (state) => state.adminEmployeeAllocation.status;
export const selectError = (state) => state.adminEmployeeAllocation.error;
export const selectSearchTerm = (state) => state.adminEmployeeAllocation.searchTerm;
export const selectAddingEmployee = (state) => state.adminEmployeeAllocation.addingEmployee;
export const selectRemovingEmployee = (state) => state.adminEmployeeAllocation.removingEmployee;
export const selectRemovingPosition = (state) => state.adminEmployeeAllocation.removingPosition;
export const selectLoadingAllocated = (state) => state.adminEmployeeAllocation.loadingAllocated;

export default employeeAllocationSlice.reducer;