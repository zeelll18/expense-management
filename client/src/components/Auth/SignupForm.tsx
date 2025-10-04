import {Link} from "@mui/material";
import {Box, Button, TextField, Typography} from "@mui/material";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {useSnackbar} from "notistack";
import {setCredentials} from "../../store/slices/authSlice";
import api from "../../utils/api";
import CountrySelect from "../common/CountrySelect";
import TermsCheckbox from "../common/TermsCheckbox";

interface SignupFormData
{
  name: string;
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
  const {enqueueSnackbar} = useSnackbar();
  const password = watch("password");

  const onSubmit = async(data: SignupFormData) =>
  {
    if(!agreedToTerms) {
      enqueueSnackbar("Please agree to the terms and conditions", {variant: "warning"});
      return;
    }

    try
    {
      // Get currency from country selection
      const countriesResponse = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies");
      const countries = await countriesResponse.json();
      const selectedCountry = countries.find((c: any) => c.name.common === data.country);
      const currency = selectedCountry ? Object.keys(selectedCountry.currencies)[0] : "USD";

      const response = await api.post("/auth/signup", {
        name: data.name,
        email: data.email,
        password: data.password,
        currency
      });
      dispatch(setCredentials({
        userId: response.data.userId,
        companyId: response.data.companyId,
        role: response.data.role
      }));
      enqueueSnackbar("Account created successfully!", {variant: "success"});
      navigate("/home"); // Redirect after signup
    }
    catch(error: any)
    {
      console.error("Signup failed:", error);
      const errorMessage = error.response?.data?.error || "Signup failed. Please try again.";
      enqueueSnackbar(errorMessage, {variant: "error"});
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{mt: 1}}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        autoComplete="name"
        autoFocus
        {...register("name", {required: "Name is required"})}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        autoComplete="email"
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
