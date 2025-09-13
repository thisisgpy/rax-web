import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/services/auth';
import type { AuthState, User, LoginRequest } from '@/types';

const initialState: AuthState = {
  isAuthenticated: authApi.isAuthenticated(),
  user: authApi.getCurrentUser(),
  token: authApi.getToken(),
};

// 异步 thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '登录失败');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (userId: string, { rejectWithValue }) => {
    try {
      await authApi.logout(userId);
    } catch (error: any) {
      // 即使登出接口失败，也继续清除状态
      console.warn('Logout API failed:', error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      authApi.clearAuth();
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginAsync.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearAuth, setUser } = authSlice.actions;
export default authSlice.reducer;