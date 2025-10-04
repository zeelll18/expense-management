import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {Avatar, Container, Paper, Typography} from "@mui/material";
import React from "react";
import LoginForm from "../components/Auth/LoginForm";

const LoginPage: React.FC = () => (
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
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      <LoginForm />
    </Paper>
  </Container>
);

export default LoginPage;
