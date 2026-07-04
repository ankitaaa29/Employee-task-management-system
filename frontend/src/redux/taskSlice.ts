import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskApi, TaskQueryParams } from '../api/taskApi';

interface TaskState {
  tasks: any[];
  activeTask: any | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  dashboardStats: any | null;
  dashboardCharts: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  activeTask: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  dashboardStats: null,
  dashboardCharts: null,
  loading: false,
  error: null
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params: TaskQueryParams | undefined, { rejectWithValue }) => {
    try {
      const data = await taskApi.getTasks(params);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const data = await taskApi.getTaskById(id);
      return data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch task details');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const data = await taskApi.createTask(formData);
      return data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, formData }: { id: number | string; formData: FormData | any }, { rejectWithValue }) => {
    try {
      const data = await taskApi.updateTask(id, formData);
      return data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'tasks/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await taskApi.getDashboardStats();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearActiveTask: (state) => {
      state.activeTask = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      if (action.payload.tasks) {
        state.tasks = action.payload.tasks;
      }
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    });
    builder.addCase(fetchTasks.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Task By ID
    builder.addCase(fetchTaskById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTaskById.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.activeTask = action.payload;
    });
    builder.addCase(fetchTaskById.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create Task
    builder.addCase(createTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTask.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.tasks.unshift(action.payload);
      state.pagination.total += 1;
    });
    builder.addCase(createTask.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Task
    builder.addCase(updateTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTask.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      const idx = state.tasks.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) {
        state.tasks[idx] = action.payload;
      }
      if (state.activeTask && state.activeTask.id === action.payload.id) {
        state.activeTask = action.payload;
      }
    });
    builder.addCase(updateTask.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete Task
    builder.addCase(deleteTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTask.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      state.pagination.total -= 1;
    });
    builder.addCase(deleteTask.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Dashboard Stats
    builder.addCase(fetchDashboardStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.dashboardStats = action.payload.stats;
      state.dashboardCharts = action.payload.charts || null;
    });
    builder.addCase(fetchDashboardStats.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { clearActiveTask } = taskSlice.actions;
export default taskSlice.reducer;
