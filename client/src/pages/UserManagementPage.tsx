import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton
} from "@mui/material";
import {Settings} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {useSnackbar} from "notistack";
import {RootState} from "../store";
import api from "../utils/api";
import AddUserDialog from "../components/UserManagement/AddUserDialog";
import ApprovalSettingsDialog from "../components/UserManagement/ApprovalSettingsDialog";

interface User
{
  id: number;
  name: string;
  email: string;
  role: string;
  manager_id: number | null;
}

const UserManagementPage: React.FC = () =>
{
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const {companyId, role} = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<Array<{id: number; name: string}>>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApprovalSettings, setOpenApprovalSettings] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() =>
  {
    if(role !== "admin")
    {
      enqueueSnackbar("Access denied. Admin only.", {variant: "error"});
      navigate("/home");
    }
  }, [role, navigate, enqueueSnackbar]);

  const fetchUsers = async() =>
  {
    try
    {
      const response = await api.get(`/users/${companyId}`);
      setUsers(response.data.users);

      // Filter managers for the dropdown
      const managerList = response.data.users
        .filter((u: User) => u.role === "manager" || u.role === "admin")
        .map((u: User) => ({id: u.id, name: u.name}));
      setManagers(managerList);
    }
    catch(error: any)
    {
      console.error("Failed to fetch users:", error);
      enqueueSnackbar("Failed to load users", {variant: "error"});
    }
    finally
    {
      setLoading(false);
    }
  };

  useEffect(() =>
  {
    if(companyId && role === "admin")
    {
      fetchUsers();
    }
  }, [companyId, role]);

  const handleAddUser = () =>
  {
    setOpenDialog(true);
  };

  const handleCloseDialog = () =>
  {
    setOpenDialog(false);
  };

  const handleUserAdded = () =>
  {
    fetchUsers();
  };

  const handleOpenApprovalSettings = (user: User) =>
  {
    setSelectedUser(user);
    setOpenApprovalSettings(true);
  };

  const handleCloseApprovalSettings = () =>
  {
    setOpenApprovalSettings(false);
    setSelectedUser(null);
  };

  const getRoleColor = (userRole: string) =>
  {
    switch(userRole)
    {
      case "admin":
        return "error";
      case "manager":
        return "warning";
      case "employee":
        return "info";
      default:
        return "default";
    }
  };

  if(role !== "admin") return null;

  return (
    <Container maxWidth="lg">
      <Box sx={{marginTop: 4, marginBottom: 4}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
          <Typography component="h1" variant="h4">
            User Management
          </Typography>
          <Box>
            <Button variant="outlined" onClick={() => navigate("/home")} sx={{mr: 2}}>
              Back to Home
            </Button>
            <Button variant="contained" onClick={handleAddUser}>
              Add User
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Manager ID</strong></TableCell>
                <TableCell><strong>Approval Settings</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.manager_id || "-"}</TableCell>
                    <TableCell>
                      {user.role !== "admin" ? (
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenApprovalSettings(user)}
                          title="Configure Approval Settings"
                        >
                          <Settings />
                        </IconButton>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <AddUserDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onUserAdded={handleUserAdded}
        managers={managers}
      />

      <ApprovalSettingsDialog
        open={openApprovalSettings}
        onClose={handleCloseApprovalSettings}
        user={selectedUser}
        allUsers={users}
      />
    </Container>
  );
};

export default UserManagementPage;
