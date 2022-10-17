import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Box, Button, Popper, Fade, ClickAwayListener } from '@mui/material';

export default function OptionsPopper({ children }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className='App'>
      <Button
        onClick={handleOpen}
        sx={{
          alignSelf: 'center',
          height: 35,
          color: 'white',
          backgroundColor: 'rgb(0,187,0)',
          borderRadius: 35,
          margin: '2px 0px 0px 5px',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: 'rgb(0,157,0)',
          },
        }}
      >
        Show Chart Options
      </Button>
      <div>
        <Popper open={open} anchorEl={anchorEl} transition>
          {({ TransitionProps }) => (
            <ClickAwayListener onClickAway={handleClose}>
              <Fade {...TransitionProps} timeout={150}>
                <Box
                  sx={{
                    backgroundColor: 'white',
                    height: 400,
                    width: 200,
                    border: '1px solid rgb(0,170,0)',
                    borderRadius: '8px',
                    boxShadow: '1px 4px 6px 3px rgba(137, 137, 137, 0.54)',
                    position: 'relative',
                    top: -20,
                    left: 20,
                  }}
                >
                  <Box sx={{ height: '10px' }} />
                  <Box
                    sx={{
                      boxSizing: 'border-box',
                      padding: '0px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {children}
                  </Box>
                </Box>
              </Fade>
            </ClickAwayListener>
          )}
        </Popper>
      </div>
    </div>
  );
}

OptionsPopper.propTypes = {
  children: PropTypes.node,
};
