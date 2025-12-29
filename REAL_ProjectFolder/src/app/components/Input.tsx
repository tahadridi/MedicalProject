/// app/src/components/Input.tsx
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface InputProps extends Omit<TextFieldProps, 'size'> {
  label?: string;
  id: string;
  size?: 'small' | 'medium';
}

const Input: React.FC<InputProps> = ({ label, id, size = 'medium', ...props }) => {
  return <TextField fullWidth id={id} label={label} variant="outlined" size={size} {...props} />;
};

export default Input;