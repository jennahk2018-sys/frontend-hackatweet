import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    userId: null,
    token: null,
    firstname: null,
    username: null,
    avatar: null,
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
      state.value.avatar = action.payload.avatar || null;
    },
    logout: (state) => {
      state.value.token = null;
      state.value.firstname = null;
      state.value.username = null;
      state.value.userId = null;
      state.value.avatar = null;
    },
    // Changer d'avatar sans avoir à se reconnecter
    updateAvatar: (state, action) => {
      state.value.avatar = action.payload;
    },
  },
});

export const { login, logout, updateAvatar } = userSlice.actions;
export default userSlice.reducer;
