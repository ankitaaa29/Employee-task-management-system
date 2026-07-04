import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeApi, EmployeeQueryParams } from '../api/employeeApi';

interface EmployeeState {
  employees: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  error: null
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (params: EmployeeQueryParams | undefined, { rejectWithValue }) => {
    try {
      const data = await employeeApi.getEmployees(params);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (employeeData: any, { rejectWithValue }) => {
    try {
      const data = await employeeApi.createEmployee(employeeData);
      return data.employee;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, employeeData }: { id: number | string; employeeData: any }, { rejectWithValue }) => {
    try {
      const data = await employeeApi.updateEmployee(id, employeeData);
      return data.employee;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await employeeApi.deleteEmployee(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete employee');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Employees
    builder.addCase(fetchEmployees.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      if (action.payload.employees) {
        state.employees = action.payload.employees;
      }
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    });
    builder.addCase(fetchEmployees.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create Employee
    builder.addCase(createEmployee.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createEmployee.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.employees.unshift(action.payload);
      state.pagination.total += 1;
    });
    builder.addCase(createEmployee.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Employee
    builder.addCase(updateEmployee.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateEmployee.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      const idx = state.employees.findIndex(emp => emp.id === action.payload.id);
      if (idx !== -1) {
        state.employees[idx] = action.payload;
      }
    });
    builder.addCase(updateEmployee.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete Employee
    builder.addCase(deleteEmployee.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteEmployee.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
      state.pagination.total -= 1;
    });
    builder.addCase(deleteEmployee.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export default employeeSlice.reducer;
