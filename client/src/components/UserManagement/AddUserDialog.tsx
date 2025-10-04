import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from "@mui/material";
import React from "react";
import {useForm, Controller} from "react-hook-form";
import {useSnackbar} from "notistack";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import api from "../../utils/api";

interface AddUserDialogProps
{
  open: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  managers: Array<{id: number; name: string}>;
}

interface AddUserFormData
{
  name: string;
  email: string;
  password: string;
  role: string;
  managerId: number | null;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({open, onClose, onUserAdded, managers}) =>
{
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: {errors}
  } = useForm<AddUserFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
      managerId: null
    }
  });
  const {enqueueSnackbar} = useSnackbar();
  const {companyId} = useSelector((state: RootState) => state.auth);
  const selectedRole = watch("role");

  const onSubmit = async(data: AddUserFormData) =>
  {
    try
    {
      await api.post("/users", {
        companyId,
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        managerId: data.managerId
      });

      enqueueSnackbar("User created successfully!", {variant: "success"});
      reset();
      onUserAdded();
      onClose();
    }
    catch(error: any)
    {
      console.error("User creation failed:", error);
      const errorMessage = error.response?.data?.error || "Failed to create user";
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
      <DialogTitle>Add New User</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="User Name"
            {...register("name", {required: "Name is required"})}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
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
            {...register("password", {
              required: "Password is required",
              minLength: {value: 6, message: "Password must be at least 6 characters"}
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Controller
              name="role"
              control={control}
              rules={{required: "Role is required"}}
              render={({field}) => (
                <Select {...field} label="Role">
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              )}
            />
          </FormControl>
          {selectedRole === "employee" && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Manager (Optional)</InputLabel>
              <Controller
                name="managerId"
                control={control}
                render={({field}) => (
                  <Select
                    {...field}
                    label="Manager (Optional)"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  >
                    <MenuItem value="">None</MenuItem>
                    {managers.map((manager) => (
                      <MenuItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Add User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUserDialog;
