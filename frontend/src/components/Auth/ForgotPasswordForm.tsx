import {Box, Button, Link, TextField} from "@mui/material";
import React from "react";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import api from "../../utils/api";

interface ForgotPasswordFormData
{
  email: string;
}

const ForgotPasswordForm: React.FC = () =>
{
  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<ForgotPasswordFormData>();
  const navigate = useNavigate();

  const onSubmit = async(data: ForgotPasswordFormData) =>
  {
    try
    {
      await api.post("/auth/forgot-password", data);
      // Handle success (e.g., show message: "Reset link sent")
      navigate("/login");
    }
    catch(error)
    {
      console.error("Forgot password failed:", error);
      // Handle error
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
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{
          mt: 3,
          mb: 2
        }}
      >
        Send Reset Link
      </Button>
      <Box sx={{textAlign: "center"}}>
        <Link href="/login" variant="body2">
          Back to Sign In
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;
