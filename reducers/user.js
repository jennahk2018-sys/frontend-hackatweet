import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    userId: null,
    token: null,
    firstname: null,
    username: null,
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.value.token = action.payload.token;
      state.value.firstname = action.payload.firstname;
      state.value.username = action.payload.username;
      state.value.userId = action.payload.userId;
      
    },
    logout: (state) => {
      state.value.token = null;
      state.value.firstname = null;
      state.value.username = null;
      state.value.userId = null;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
