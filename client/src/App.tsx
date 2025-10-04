import CssBaseline from "@mui/material/CssBaseline";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import React from "react";
import {Provider} from "react-redux";
import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import {SnackbarProvider} from "notistack";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import UserManagementPage from "./pages/UserManagementPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import ExpensesPage from "./pages/ExpensesPage";
import ManagerExpensesPage from "./pages/ManagerExpensesPage";
import {store} from "./store";

const theme = createTheme();

const App: React.FC = () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/manager-expenses" element={<ManagerExpensesPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  </Provider>
);

export default App;
