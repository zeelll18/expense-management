import {Box, Button, Link, TextField, Typography} from "@mui/material";
import React from "react";
import {useForm} from "react-hook-form";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {setCredentials} from "../../store/slices/authSlice";
import api from "../../utils/api";

interface LoginFormData
{
  email: string;
  password: string;
}

const LoginForm: React.FC = () =>
{
  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<LoginFormData>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async(data: LoginFormData) =>
  {
    try
    {
      const response = await api.post("/auth/login", data);
      dispatch(setCredentials({
        token: response.data.token,
        user: response.data.user
      }));
      navigate("/dashboard"); // Redirect to dashboard after login
    }
    catch(error)
    {
      console.error("Login failed:", error);
      // Handle error (e.g., show toast)
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{mt: 1}}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        autoComplete="email"
        autoFocus
        {...register("email", {required: "Email is required"})}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        {...register("password", {required: "Password is required"})}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{
          mt: 3,
          mb: 2
        }}
      >
        Sign In
      </Button>
      <Box sx={{textAlign: "center"}}>
        <Link href="/forgot-password" variant="body2">
          Forgot password?
        </Link>
      </Box>
      <Box
        sx={{
          textAlign: "center",
          mt: 2
        }}
      >
        <Typography variant="body2">
          Don't have an account? <Link href="/signup">Sign Up</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
