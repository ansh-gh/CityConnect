import { createSlice } from '@reduxjs/toolkit';

const initialToken = localStorage.getItem('accessToken') || null;
let initialUser = null;
try {
  const storedUser = localStorage.getItem('user');
  initialUser = storedUser ? JSON.parse(storedUser) : null;
} catch (e) {
  initialUser = null;
}

const initialState = {
  user: initialUser,
  token: initialToken, // We keep the internal Redux field name 'token' for convenience
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload; // token corresponds to accessToken, user corresponds to admin
      state.user = user;
      state.token = token;
      
      // Store in localStorage using the key specified by backend contract
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
