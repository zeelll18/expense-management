import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from "@mui/material";
import React from "react";
import {useForm, Controller} from "react-hook-form";
import {useSnackbar} from "notistack";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import api from "../../utils/api";

interface AddExpenseDialogProps
{
  open: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

interface AddExpenseFormData
{
  description: string;
  category: string;
  paidBy: string;
  remarks: string;
  amount: number;
  date: string;
}

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({open, onClose, onExpenseAdded}) =>
{
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: {errors}
  } = useForm<AddExpenseFormData>({
    defaultValues: {
      description: "",
      category: "",
      paidBy: "",
      remarks: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    }
  });
  const {enqueueSnackbar} = useSnackbar();
  const {userId, companyId} = useSelector((state: RootState) => state.auth);

  const onSubmit = async(data: AddExpenseFormData) =>
  {
    try
    {
      // Get company currency
      const companyResponse = await api.get(`/companies/${companyId}`);
      const currency = companyResponse.data.currency || "USD";

      await api.post("/expenses", {
        userId,
        amount: data.amount,
        currency,
        category: data.category,
        description: data.description,
        paidBy: data.paidBy,
        remarks: data.remarks,
        date: data.date,
        status: "draft"
      });

      enqueueSnackbar("Expense added successfully!", {variant: "success"});
      reset();
      onExpenseAdded();
      onClose();
    }
    catch(error: any)
    {
      console.error("Expense creation failed:", error);
      const errorMessage = error.response?.data?.error || "Failed to add expense";
      enqueueSnackbar(errorMessage, {variant: "error"});
    }
  };

  const handleClose = () =>
  {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Expense</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Description"
            multiline
            rows={2}
            {...register("description", {required: "Description is required"})}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Controller
              name="category"
              control={control}
              rules={{required: "Category is required"}}
              render={({field}) => (
                <Select {...field} label="Category">
                  <MenuItem value="Travel">Travel</MenuItem>
                  <MenuItem value="Food">Food</MenuItem>
                  <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                  <MenuItem value="Entertainment">Entertainment</MenuItem>
                  <MenuItem value="Accommodation">Accommodation</MenuItem>
                  <MenuItem value="Transportation">Transportation</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            label="Paid By"
            {...register("paidBy")}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Remarks"
            multiline
            rows={2}
            {...register("remarks")}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Amount"
            type="number"
            inputProps={{step: "0.01", min: "0"}}
            {...register("amount", {
              required: "Amount is required",
              min: {value: 0.01, message: "Amount must be greater than 0"}
            })}
            error={!!errors.amount}
            helperText={errors.amount?.message}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Date"
            type="date"
            InputLabelProps={{shrink: true}}
            {...register("date", {required: "Date is required"})}
            error={!!errors.date}
            helperText={errors.date?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Add Expense
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddExpenseDialog;
