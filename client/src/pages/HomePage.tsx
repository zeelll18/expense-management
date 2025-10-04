import {Box, Button, Container, Typography} from "@mui/material";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {logout} from "../store/slices/authSlice";
import {RootState} from "../store";

const HomePage: React.FC = () =>
{
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {userId, companyId, role} = useSelector((state: RootState) => state.auth);

  const handleLogout = () =>
  {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Typography component="h1" variant="h3" gutterBottom>
          Welcome to Expense Management
        </Typography>
        <Box sx={{mt: 4, textAlign: "center"}}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            User ID: {userId}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Company ID: {companyId}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Role: {role}
          </Typography>
        </Box>
        <Box sx={{mt: 4, display: "flex", gap: 2}}>
          {role === "admin" && (
            <Button
              variant="contained"
              onClick={() => navigate("/users")}
            >
              User Management
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
