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
  IconButton,
  Tooltip
} from "@mui/material";
import {CheckCircle, Cancel} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {useSnackbar} from "notistack";
import {RootState} from "../store";
import api from "../utils/api";

interface Expense
{
  id: number;
  user_id: number;
  employee_name: string;
  employee_email: string;
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

const ManagerExpensesPage: React.FC = () =>
{
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const {userId, companyId, role} = useSelector((state: RootState) => state.auth);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is manager or admin
  useEffect(() =>
  {
    if(role !== "manager" && role !== "admin")
    {
      enqueueSnackbar("Access denied. Manager or Admin only.", {variant: "error"});
      navigate("/home");
    }
  }, [role, navigate, enqueueSnackbar]);

  const fetchExpenses = async() =>
  {
    try
    {
      // Admin sees all company expenses, manager sees their team's expenses
      const endpoint = role === "admin"
        ? `/expenses/company/${companyId}`
        : `/expenses/manager/${userId}`;
      const response = await api.get(endpoint);
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

  useEffect(() =>
  {
    if(userId && (role === "manager" || role === "admin"))
    {
      fetchExpenses();
    }
  }, [userId, role]);

  const handleApprove = async(expenseId: number) =>
  {
    try
    {
      await api.post(`/expenses/${expenseId}/status`, {
        status: "approved"
      });

      enqueueSnackbar("Expense approved successfully!", {variant: "success"});
      fetchExpenses();
    }
    catch(error: any)
    {
      console.error("Approval failed:", error);
      const errorMessage = error.response?.data?.error || "Failed to approve expense";
      enqueueSnackbar(errorMessage, {variant: "error"});
    }
  };

  const handleReject = async(expenseId: number) =>
  {
    try
    {
      await api.post(`/expenses/${expenseId}/status`, {
        status: "rejected"
      });

      enqueueSnackbar("Expense rejected", {variant: "info"});
      fetchExpenses();
    }
    catch(error: any)
    {
      console.error("Rejection failed:", error);
      const errorMessage = error.response?.data?.error || "Failed to reject expense";
      enqueueSnackbar(errorMessage, {variant: "error"});
    }
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

  if(role !== "manager" && role !== "admin") return null;

  return (
    <Container maxWidth="xl">
      <Box sx={{marginTop: 4, marginBottom: 4}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
          <Typography component="h1" variant="h4">
            {role === "admin" ? "All Company Expenses" : "Team Expenses"}
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/home")}>
            Back to Home
          </Button>
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
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {expense.employee_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {expense.employee_email}
                        </Typography>
                      </Box>
                    </TableCell>
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
                    <TableCell>
                      {expense.status === "draft" || expense.status === "waiting_approval" ? (
                        <Box sx={{display: "flex", gap: 1}}>
                          <Tooltip title="Approve">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => handleApprove(expense.id)}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleReject(expense.id)}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
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
    </Container>
  );
};

export default ManagerExpensesPage;
