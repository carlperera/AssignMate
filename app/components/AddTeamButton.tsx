import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

interface AddTeamButtonProps {
  onAddTeam: (team: { name: string; color: string }) => void;
}

const AddTeamButton = ({ onAddTeam }: AddTeamButtonProps) => {
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTeamName('');
    setTeamColor('');
  };

  const handleSubmit = () => {
    if (teamName && teamColor) {
      onAddTeam({ name: teamName, color: teamColor });
      handleClose();
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Add Team
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Team Name"
            type="text"
            fullWidth
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <TextField
            margin="dense"
            id="color"
            label="Team Color"
            type="text"
            fullWidth
            value={teamColor}
            onChange={(e) => setTeamColor(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTeamButton;