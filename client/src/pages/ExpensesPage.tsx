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
  Chip
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {useSnackbar} from "notistack";
import {RootState} from "../store";
import api from "../utils/api";
import AddExpenseDialog from "../components/Expenses/AddExpenseDialog";

interface Expense
{
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  category: string;
  description: string;
  paid_by: string;
  remarks: string;
  date: string;
  status: string;
  created_at: string;
}

interface User
{
  id: number;
  name: string;
}

const ExpensesPage: React.FC = () =>
{
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const {userId, companyId} = useSelector((state: RootState) => state.auth);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async() =>
  {
    try
    {
      const response = await api.get(`/expenses/user/${userId}`);
      setExpenses(response.data.expenses);
    }
    catch(error: any)
    {
      console.error("Failed to fetch expenses:", error);
      enqueueSnackbar("Failed to load expenses", {variant: "error"});
    }
    finally
    {
      setLoading(false);
    }
  };

  const fetchUsers = async() =>
  {
    try
    {
      const response = await api.get(`/users/${companyId}`);
      setUsers(response.data.users);
    }
    catch(error: any)
    {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() =>
  {
    if(userId && companyId)
    {
      fetchExpenses();
      fetchUsers();
    }
  }, [userId, companyId]);

  const handleAddExpense = () =>
  {
    setOpenDialog(true);
  };

  const handleCloseDialog = () =>
  {
    setOpenDialog(false);
  };

  const handleExpenseAdded = () =>
  {
    fetchExpenses();
  };

  const getUserName = (userId: number) =>
  {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const getStatusColor = (status: string) =>
  {
    switch(status)
    {
      case "draft":
        return "default";
      case "waiting_approval":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) =>
  {
    switch(status)
    {
      case "draft":
        return "Draft";
      case "waiting_approval":
        return "Waiting Approval";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{marginTop: 4, marginBottom: 4}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
          <Typography component="h1" variant="h4">
            My Expenses
          </Typography>
          <Box>
            <Button variant="outlined" onClick={() => navigate("/home")} sx={{mr: 2}}>
              Back to Home
            </Button>
            <Button variant="contained" onClick={handleAddExpense}>
              Add Expense
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Employee</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Paid By</strong></TableCell>
                <TableCell><strong>Remarks</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No expenses found. Click "Add Expense" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{getUserName(expense.user_id)}</TableCell>
                    <TableCell>
                      {expense.description?.substring(0, 40)}
                      {expense.description?.length > 40 ? "..." : ""}
                    </TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.paid_by || "-"}</TableCell>
                    <TableCell>
                      {expense.remarks ? (
                        <>
                          {expense.remarks.substring(0, 30)}
                          {expense.remarks.length > 30 ? "..." : ""}
                        </>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {expense.amount} {expense.currency}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(expense.status)}
                        color={getStatusColor(expense.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <AddExpenseDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onExpenseAdded={handleExpenseAdded}
      />
    </Container>
  );
};

export default ExpensesPage;
