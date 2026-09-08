import React from 'react';
import { Snackbar, Alert  } from '@mui/material';

const Snakebar = ({ open, onClose, content, severity }) => {
  return (
    <div>
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      message={content}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
         <Alert
          onClose={onClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
        {content}
        </Alert>
        </Snackbar>
        </div>
  );
};

export default Snakebar;