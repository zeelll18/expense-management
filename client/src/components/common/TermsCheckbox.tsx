import {Checkbox, FormControlLabel} from "@mui/material";
import React from "react";

interface TermsCheckboxProps
{
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  checked,
  onChange
}) => (
  <FormControlLabel
    control={<Checkbox checked={checked} onChange={onChange} />}
    label="I agree to the Terms and Conditions"
  />
);

export default TermsCheckbox;
