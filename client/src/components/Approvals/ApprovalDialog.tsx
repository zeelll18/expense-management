import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
  Divider
} from "@mui/material";
import React, {useState} from "react";
import {useSnackbar} from "notistack";
import api from "../../utils/api";

interface ApprovalDialogProps
{
  open: boolean;
  onClose: () => void;
  approval: any;
  onApprovalUpdated: () => void;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({open, onClose, approval, onApprovalUpdated}) =>
{
  const {enqueueSnackbar} = useSnackbar();
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async() =>
  {
    setLoading(true);
    try
    {
      await api.post(`/approvals/${approval.id}`, {
        status: "approved",
        comments
      });

      enqueueSnackbar("Expense approved successfully!", {variant: "success"});
      onApprovalUpdated();
      handleClose();
    }
    catch(error: any)
    {
      console.error("Approval failed:", error);
      const errorMessage = error.response?.data?.error || "Failed to approve expense";
      enqueueSnackbar(errorMessage, {variant: "error"});
    }
    finally
    {
      setLoading(false);
    }
  };

  const handleReject = async() =>
  {
    if(!comments.trim())
    {
      enqueueSnackbar("Please provide a reason for rejection", {variant: "warning"});
      return;
    }

    setLoading(true);
    try
    {
      await api.post(`/approvals/${approval.id}`, {
        status: "rejected",
        comments
      });

      enqueueSnackbar("Expense rejected", {variant: "info"});
      onApprovalUpdated();
      handleClose();
    }
    catch(error: any)
    {
      console.error("Rejection failed:", error);
      const errorMessage = error.response?.data?.error || "Failed to reject expense";
      enqueueSnackbar(errorMessage, {variant: "error"});
    }
    finally
    {
      setLoading(false);
    }
  };

  const handleClose = () =>
  {
    setComments("");
    onClose();
  };

  if(!approval) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Review Expense</DialogTitle>
      <DialogContent>
        <Box sx={{mb: 2}}>
          <Typography variant="subtitle2" color="text.secondary">
            Amount
          </Typography>
          <Typography variant="h5" gutterBottom>
            {approval.amount} {approval.currency}
          </Typography>
        </Box>

        <Divider sx={{my: 2}} />

        <Box sx={{mb: 2}}>
          <Typography variant="subtitle2" color="text.secondary">
            Category
          </Typography>
          <Typography variant="body1">
            {approval.category}
          </Typography>
        </Box>

        <Box sx={{mb: 2}}>
          <Typography variant="subtitle2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1">
            {approval.description || "No description"}
          </Typography>
        </Box>

        <Box sx={{mb: 2}}>
          <Typography variant="subtitle2" color="text.secondary">
            Date
          </Typography>
          <Typography variant="body1">
            {approval.date}
          </Typography>
        </Box>

        <Divider sx={{my: 2}} />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Comments"
          placeholder="Add comments (required for rejection)"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          sx={{mt: 2}}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleReject}
          color="error"
          variant="outlined"
          disabled={loading}
        >
          Reject
        </Button>
        <Button
          onClick={handleApprove}
          color="success"
          variant="contained"
          disabled={loading}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalDialog;
