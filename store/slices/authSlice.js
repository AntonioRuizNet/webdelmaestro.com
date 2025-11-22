import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: "unknown", // 'unknown' | 'authenticated' | 'unauthenticated'
  user: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state, action) {
      state.status = "authenticated";
      state.user = action.payload || null;
    },
    setUnauthenticated(state) {
      state.status = "unauthenticated";
      state.user = null;
    }
  }
});

export const { setAuthenticated, setUnauthenticated } = authSlice.actions;
export default authSlice.reducer;
