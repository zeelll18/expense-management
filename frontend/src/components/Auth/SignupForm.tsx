import {Link} from "@mui/material";
import {Box, Button, TextField, Typography} from "@mui/material";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {setCredentials} from "../../store/slices/authSlice";
import api from "../../utils/api";
import CountrySelect from "../common/CountrySelect";
import TermsCheckbox from "../common/TermsCheckbox";

interface SignupFormData
{
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  terms: boolean;
}

const SignupForm: React.FC = () =>
{
  const {
    register,
    handleSubmit,
    watch,
    formState: {errors}
  } = useForm<SignupFormData>();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async(data: SignupFormData) =>
  {
    if(!agreedToTerms) return; // Prevent submit if not agreed

    try
    {
      const response = await api.post("/auth/signup", {
        email: data.email,
        password: data.password,
        country: data.country
      });
      dispatch(setCredentials({
        token: response.data.token,
        user: response.data.user
      }));
      navigate("/dashboard"); // Redirect after signup
    }
    catch(error)
    {
      console.error("Signup failed:", error);
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
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters"
          }
        })}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        {...register("confirmPassword", {
          required: "Please confirm your password",
          validate: (value) => value === password || "Passwords do not match"
        })}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />
      <CountrySelect
        value={watch("country") || ""}
        onChange={(e) => register("country").onChange(e)}
      />
      <TermsCheckbox
        checked={agreedToTerms}
        onChange={(e) => setAgreedToTerms(e.target.checked)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{
          mt: 3,
          mb: 2
        }}
        disabled={!agreedToTerms}
      >
        Sign Up
      </Button>
      <Box sx={{textAlign: "center"}}>
        <Typography variant="body2">
          Already have an account? <Link href="/login">Sign In</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignupForm;
