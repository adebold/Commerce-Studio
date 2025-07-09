import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../services/auth-api';

export const login = createAsyncThunk('auth/login', async (credentials) => {
  const response = await api.login(credentials);
  localStorage.setItem('token', response.data.token);
  return response.data;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.logout();
  localStorage.removeItem('token');
});

export const fetchUserProfile = createAsyncThunk('auth/fetchUserProfile', async () => {
  const response = await api.getUserProfile();
  return response.data;
});

const initialState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export default authSlice.reducer;