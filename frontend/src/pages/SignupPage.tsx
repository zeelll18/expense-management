import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {Avatar, Container, Paper, Typography} from "@mui/material";
import React from "react";
import SignupForm from "../components/Auth/SignupForm";

const SignupPage: React.FC = () => (
  <Container component="main" maxWidth="xs">
    <Paper
      elevation={3}
      sx={{
        p: 4,
        mt: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <Avatar
        sx={{
          m: 1,
          bgcolor: "secondary.main"
        }}
      >
        <PersonAddIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Admin Company Sign Up
      </Typography>
      <SignupForm />
    </Paper>
  </Container>
);

export default SignupPage;
