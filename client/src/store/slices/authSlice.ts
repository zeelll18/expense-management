import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AuthState
{
  userId: number | null;
  companyId: number | null;
  role: string | null;
}

const initialState: AuthState = {
  userId: sessionStorage.getItem("userId") ? Number(sessionStorage.getItem("userId")) : null,
  companyId: sessionStorage.getItem("companyId") ? Number(sessionStorage.getItem("companyId")) : null,
  role: sessionStorage.getItem("role")
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
      sessionStorage.setItem("userId", action.payload.userId.toString());
      sessionStorage.setItem("companyId", action.payload.companyId.toString());
      sessionStorage.setItem("role", action.payload.role);
    },
    logout: (state) =>
    {
      state.userId = null;
      state.companyId = null;
      state.role = null;
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("companyId");
      sessionStorage.removeItem("role");
    }
  }
});

export const {
  setCredentials,
  logout
} = authSlice.actions;
export default authSlice.reducer;
