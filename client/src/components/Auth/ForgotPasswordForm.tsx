import {Box, Button, Link, TextField} from "@mui/material";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {useSnackbar} from "notistack";
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
  const {enqueueSnackbar} = useSnackbar();
  const [loading, setLoading] = useState(false);

  const onSubmit = async(data: ForgotPasswordFormData) =>
  {
    setLoading(true);
    try
    {
      const response = await api.post("/auth/forgot-password", data);
      enqueueSnackbar(response.data.message || "New password sent to your email", {variant: "success"});
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
    catch(error: any)
    {
      console.error("Forgot password failed:", error);
      const errorMessage = error.response?.data?.error || "Failed to reset password. Please try again.";
      enqueueSnackbar(errorMessage, {variant: "error"});
    }
    finally
    {
      setLoading(false);
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
        disabled={loading}
        sx={{
          mt: 3,
          mb: 2
        }}
      >
        {loading ? "Sending..." : "Send New Password"}
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
