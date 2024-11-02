import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCategories = createAsyncThunk(
  'employeeAllocation/fetchCategories',
  async () => {
    const response = await axios.get('/src/utils/categories.json');
    return response.data;
  }
);

export const fetchEmployees = createAsyncThunk(
  'employeeAllocation/fetchEmployees',
  async () => {
    const response = await axios.get('/src/utils/employees.json');
    return response.data;
  }
);

const employeeAllocationSlice = createSlice({
  name: 'employeeAllocation',
  initialState: {
    categories: [],
    employees: [],
    allocatedSections: [],
    selectedCategory: '',
    status: 'idle',
    error: null,
    searchTerm: ''
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      if (!state.allocatedSections.find(section => section.category === action.payload)) {
        state.allocatedSections.push({
          category: action.payload,
          employees: []
        });
      }
    },
    addEmployee: (state, action) => {
      const sectionIndex = state.allocatedSections.findIndex(
        section => section.category === state.selectedCategory
      );
      if (sectionIndex !== -1) {
        const section = state.allocatedSections[sectionIndex];
        if (!section.employees.find(emp => emp.id === action.payload.id)) {
          section.employees.push(action.payload);
        }
      }
    },
    removeEmployee: (state, action) => {
      const { categoryName, employeeId } = action.payload;
      const sectionIndex = state.allocatedSections.findIndex(
        section => section.category === categoryName
      );
      if (sectionIndex !== -1) {
        state.allocatedSections[sectionIndex].employees = 
          state.allocatedSections[sectionIndex].employees.filter(
            emp => emp.id !== employeeId
          );
      }
    },
    removeCategory: (state, action) => {
      state.allocatedSections = state.allocatedSections.filter(
        section => section.category !== action.payload
      );
      if (state.selectedCategory === action.payload) {
        state.selectedCategory = '';
      }
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload.categories;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = action.payload.employees;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const {
  setSelectedCategory,
  addEmployee,
  removeEmployee,
  removeCategory,
  setSearchTerm
} = employeeAllocationSlice.actions;

export const selectCategories = (state) => state.adminEmployeeAllocation.categories;
export const selectEmployees = (state) => state.adminEmployeeAllocation.employees;
export const selectAllocatedSections = (state) => state.adminEmployeeAllocation.allocatedSections;
export const selectSelectedCategory = (state) => state.adminEmployeeAllocation.selectedCategory;
export const selectStatus = (state) => state.adminEmployeeAllocation.status;
export const selectError = (state) => state.adminEmployeeAllocation.error;
export const selectSearchTerm = (state) => state.adminEmployeeAllocation.searchTerm;

export default employeeAllocationSlice.reducer;