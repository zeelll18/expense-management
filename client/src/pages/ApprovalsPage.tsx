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
import {Visibility} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {useSnackbar} from "notistack";
import {RootState} from "../store";
import api from "../utils/api";
import ApprovalDialog from "../components/Approvals/ApprovalDialog";

interface Approval
{
  id: number;
  expense_id: number;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  status: string;
  sequence: number;
}

const ApprovalsPage: React.FC = () =>
{
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const {userId, role} = useSelector((state: RootState) => state.auth);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin or manager
  useEffect(() =>
  {
    if(role !== "admin" && role !== "manager")
    {
      enqueueSnackbar("Access denied. Admin/Manager only.", {variant: "error"});
      navigate("/home");
    }
  }, [role, navigate, enqueueSnackbar]);

  const fetchApprovals = async() =>
  {
    try
    {
      const response = await api.get(`/approvals/pending/${userId}`);
      setApprovals(response.data.approvals);
    }
    catch(error: any)
    {
      console.error("Failed to fetch approvals:", error);
      enqueueSnackbar("Failed to load approvals", {variant: "error"});
    }
    finally
    {
      setLoading(false);
    }
  };

  useEffect(() =>
  {
    if(userId && (role === "admin" || role === "manager"))
    {
      fetchApprovals();
    }
  }, [userId, role]);

  const handleReview = (approval: Approval) =>
  {
    setSelectedApproval(approval);
    setOpenDialog(true);
  };

  const handleCloseDialog = () =>
  {
    setOpenDialog(false);
    setSelectedApproval(null);
  };

  const handleApprovalUpdated = () =>
  {
    fetchApprovals();
  };

  if(role !== "admin" && role !== "manager") return null;

  return (
    <Container maxWidth="lg">
      <Box sx={{marginTop: 4, marginBottom: 4}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
          <Typography component="h1" variant="h4">
            Pending Approvals
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/home")}>
            Back to Home
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : approvals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No pending approvals
                  </TableCell>
                </TableRow>
              ) : (
                approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>{approval.expense_id}</TableCell>
                    <TableCell>
                      {approval.amount} {approval.currency}
                    </TableCell>
                    <TableCell>{approval.category}</TableCell>
                    <TableCell>
                      {approval.description?.substring(0, 30)}
                      {approval.description?.length > 30 ? "..." : ""}
                    </TableCell>
                    <TableCell>{approval.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={approval.status}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleReview(approval)}
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {selectedApproval && (
        <ApprovalDialog
          open={openDialog}
          onClose={handleCloseDialog}
          approval={selectedApproval}
          onApprovalUpdated={handleApprovalUpdated}
        />
      )}
    </Container>
  );
};

export default ApprovalsPage;
