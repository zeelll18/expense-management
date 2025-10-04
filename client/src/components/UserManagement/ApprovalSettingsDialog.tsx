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
  TextField,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from "@mui/material";
import {Delete, Add} from "@mui/icons-material";
import React, {useState, useEffect} from "react";
import {useSnackbar} from "notistack";
import {useSelector} from "react-redux";
import {Controller, useForm} from "react-hook-form";
import {RootState} from "../../store";
import api from "../../utils/api";

interface ApprovalSettingsDialogProps
{
  open: boolean;
  onClose: () => void;
  user: {id: number; name: string; email: string} | null;
  allUsers: Array<{id: number; name: string; role: string}>;
}

interface ApprovalSettingsFormData
{
  ruleType: string;
  percentage: number | null;
  specificApproverId: number | null;
  isManagerApprover: boolean;
}

interface Approver
{
  userId: number;
  name: string;
  sequence: number;
}

const ApprovalSettingsDialog: React.FC<ApprovalSettingsDialogProps> = ({
  open,
  onClose,
  user,
  allUsers
}) =>
{
  const {enqueueSnackbar} = useSnackbar();
  const {companyId} = useSelector((state: RootState) => state.auth);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [selectedApproverId, setSelectedApproverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: {errors}
  } = useForm<ApprovalSettingsFormData>({
    defaultValues: {
      ruleType: "percentage",
      percentage: 50,
      specificApproverId: null,
      isManagerApprover: true
    }
  });

  const ruleType = watch("ruleType");

  // Fetch existing approval rules and approvers when dialog opens
  useEffect(() => {
    const fetchApprovalSettings = async () => {
      if (!open || !user) return;

      setLoading(true);
      try {
        // Get approval rule for this specific user
        const rulesResponse = await api.get(`/approval-rules/user/${user.id}`);
        const rule = rulesResponse.data.rule;

        if (rule) {
          setValue("ruleType", rule.rule_type);
          setValue("percentage", rule.percentage);
          setValue("specificApproverId", rule.specific_approver_id);
          setValue("isManagerApprover", rule.is_manager_approver === 1);

          // Fetch approvers for this rule
          const approversResponse = await api.get(`/approvers/${rule.id}`);
          const fetchedApprovers = approversResponse.data.approvers;

          if (fetchedApprovers && fetchedApprovers.length > 0) {
            setApprovers(
              fetchedApprovers.map((a: any) => ({
                userId: a.user_id,
                name: a.user_name,
                sequence: a.sequence
              }))
            );
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch approval settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalSettings();
  }, [open, user, setValue]);

  const handleAddApprover = () =>
  {
    if(!selectedApproverId) return;

    const approverUser = allUsers.find(u => u.id === selectedApproverId);
    if(!approverUser) return;

    // Check if already added
    if(approvers.find(a => a.userId === selectedApproverId))
    {
      enqueueSnackbar("Approver already added", {variant: "warning"});
      return;
    }

    setApprovers([
      ...approvers,
      {
        userId: selectedApproverId,
        name: approverUser.name,
        sequence: approvers.length + 1
      }
    ]);
    setSelectedApproverId(null);
  };

  const handleRemoveApprover = (userId: number) =>
  {
    const filtered = approvers.filter(a => a.userId !== userId);
    // Re-sequence
    const resequenced = filtered.map((a, index) => ({...a, sequence: index + 1}));
    setApprovers(resequenced);
  };

  const onSubmit = async(data: ApprovalSettingsFormData) =>
  {
    if(!user) return;

    try
    {
      // Create approval rule
      const ruleResponse = await api.post("/approval-rules", {
        userId: user.id,
        companyId,
        ruleType: data.ruleType,
        percentage: data.ruleType === "percentage" || data.ruleType === "hybrid" ? data.percentage : null,
        specificApproverId: data.ruleType === "specific" || data.ruleType === "hybrid" ? data.specificApproverId : null,
        isManagerApprover: data.isManagerApprover
      });

      const ruleId = ruleResponse.data.ruleId;

      // Add approvers if any
      if(approvers.length > 0)
      {
        await Promise.all(
          approvers.map(approver =>
            api.post("/approvers", {
              approvalRuleId: ruleId,
              userId: approver.userId,
              sequence: approver.sequence
            })
          )
        );
      }

      enqueueSnackbar("Approval settings saved successfully!", {variant: "success"});
      handleClose();
    }
    catch(error: any)
    {
      console.error("Failed to save approval settings:", error);
      const errorMessage = error.response?.data?.error || "Failed to save settings";
      enqueueSnackbar(errorMessage, {variant: "error"});
    }
  };

  const handleClose = () =>
  {
    reset();
    setApprovers([]);
    setSelectedApproverId(null);
    onClose();
  };

  const eligibleApprovers = allUsers.filter(
    u => u.role === "manager" || u.role === "admin"
  );

  if(!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Approval Settings for {user.name}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {loading ? (
            <Box sx={{display: "flex", justifyContent: "center", p: 3}}>
              <Typography>Loading approval settings...</Typography>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                User: {user.email}
              </Typography>

              <Divider sx={{my: 2}} />

          <Typography variant="h6" gutterBottom>
            Approval Flow Configuration
          </Typography>

          <FormControlLabel
            control={
              <Controller
                name="isManagerApprover"
                control={control}
                render={({field}) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                  />
                )}
              />
            }
            label="Requires Manager Approval First"
          />

          <Box sx={{mt: 3}}>
            <Typography variant="subtitle1" gutterBottom>
              Multi-Level Approvers (Sequential)
            </Typography>

            <Box sx={{display: "flex", gap: 2, mb: 2}}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Approver</InputLabel>
                <Select
                  value={selectedApproverId || ""}
                  onChange={(e) => setSelectedApproverId(Number(e.target.value))}
                  label="Select Approver"
                >
                  {eligibleApprovers.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddApprover}
                disabled={!selectedApproverId}
              >
                Add
              </Button>
            </Box>

            <List dense>
              {approvers.map((approver) => (
                <ListItem key={approver.userId}>
                  <ListItemText
                    primary={`${approver.sequence}. ${approver.name}`}
                    secondary={`Sequence: Step ${approver.sequence}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveApprover(approver.userId)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {approvers.length === 0 && (
                <ListItem>
                  <ListItemText secondary="No approvers added" />
                </ListItem>
              )}
            </List>
          </Box>

          <Divider sx={{my: 3}} />

          <Typography variant="subtitle1" gutterBottom>
            Conditional Approval Rules
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Rule Type</InputLabel>
            <Controller
              name="ruleType"
              control={control}
              render={({field}) => (
                <Select {...field} label="Rule Type">
                  <MenuItem value="percentage">Percentage Rule</MenuItem>
                  <MenuItem value="specific">Specific Approver Rule</MenuItem>
                  <MenuItem value="hybrid">Hybrid Rule (Both)</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          {(ruleType === "percentage" || ruleType === "hybrid") && (
            <Controller
              name="percentage"
              control={control}
              rules={{
                required: "Percentage is required",
                min: {value: 1, message: "Minimum 1%"},
                max: {value: 100, message: "Maximum 100%"}
              }}
              render={({field}) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="normal"
                  type="number"
                  label="Approval Percentage Required"
                  placeholder="e.g., 60"
                  error={!!errors.percentage}
                  helperText={errors.percentage?.message || "If 60% of approvers approve, expense is approved"}
                />
              )}
            />
          )}

          {(ruleType === "specific" || ruleType === "hybrid") && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Specific Approver (Auto-Approve)</InputLabel>
              <Controller
                name="specificApproverId"
                control={control}
                render={({field}) => (
                  <Select
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                    label="Specific Approver (Auto-Approve)"
                  >
                    <MenuItem value="">None</MenuItem>
                    {eligibleApprovers.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Save Settings
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ApprovalSettingsDialog;
