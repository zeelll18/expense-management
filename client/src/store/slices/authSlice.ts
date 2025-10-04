import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AuthState
{
  userId: number | null;
  companyId: number | null;
  role: string | null;
}

const initialState: AuthState = {
  userId: localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : null,
  companyId: localStorage.getItem("companyId") ? Number(localStorage.getItem("companyId")) : null,
  role: localStorage.getItem("role")
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{userId: number; companyId: number; role: string}>) =>
    {
      state.userId = action.payload.userId;
      state.companyId = action.payload.companyId;
      state.role = action.payload.role;
      localStorage.setItem("userId", action.payload.userId.toString());
      localStorage.setItem("companyId", action.payload.companyId.toString());
      localStorage.setItem("role", action.payload.role);
    },
    logout: (state) =>
    {
      state.userId = null;
      state.companyId = null;
      state.role = null;
      localStorage.removeItem("userId");
      localStorage.removeItem("companyId");
      localStorage.removeItem("role");
    }
  }
});

export const {
  setCredentials,
  logout
} = authSlice.actions;
export default authSlice.reducer;
