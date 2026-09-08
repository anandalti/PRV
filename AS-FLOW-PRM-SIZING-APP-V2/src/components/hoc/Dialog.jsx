import React from 'react';
import { Dialog as MuiDialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Button from '../basicComponents/Button';
import Draggable from 'react-draggable';
import '../../../src/App.css';
const PaperComponent = (props) => {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"], [class*="MuiDialogActions-root"]'}
    >
      <div {...props} />
    </Draggable>
  );
};

const Dialog = ({ open, onClose, title, children, buttons, noPadding = false, draggable = false, maxWidth="md" }) => {
  const scroll = 'paper';
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      classes={{ container: 'custom-dialog-container' }}
      PaperComponent={draggable ? PaperComponent : undefined}
      PaperProps={{ style: { maxWidth: 'md', backgroundColor: 'white' } }}
      maxWidth={maxWidth}
      scroll={scroll}
        aria-labelledby="draggable-dialog-title"
        aria-describedby="draggable-dialog-description"
    >
      <DialogTitle style={{ cursor: draggable ? 'move' : 'default', backgroundColor: 'white' }} id="draggable-dialog-title">
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers={scroll === 'paper'} id="scroll-dialog-description" style={{ padding: noPadding ? 0 : undefined, backgroundColor: 'white', maxHeight: 'calc(100vh - 200px)' }}>
        {children}
      </DialogContent>
      <DialogActions //style={{ backgroundColor: 'white' }}
      >
        {buttons?.map((button, index) => (
          <Button
            key={index}
            variant={button.variant}
            // disabled={button?.disabled===true?true:false}
            className={button.className}
            endIcon={button.endIcon}
            onClick={button.onClick}
          >
            {button.label}
          </Button>
        ))}
      </DialogActions>
    </MuiDialog>
  );
};

export default Dialog;