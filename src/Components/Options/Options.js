import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

import {
  Box,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

import LocationPicker from '../LocationPicker/LocationPicker';
import { appleTypes } from '../../Scripts/getData';

import {
  allowedStates,
  bbox,
  name,
  token,
  storeLocations,
} from '../LocationPicker/LocationVariables';

const green = 'rgb(0,187,0)';
const mediumGreen = 'rgb(0,157,0)';
const darkGreen = 'rgb(0,107,0)';
const radioSX = {
  marginLeft: '8px',
  marginBottom: '3px',
  padding: '5px',
  color: green,
  '&.Mui-checked': {
    color: green,
  },
};

// Buttons Style
const btnSX = (isSelected) => ({
  alignSelf: 'center',
  width: 145,
  height: 37,
  color: 'white',
  backgroundColor: isSelected ? darkGreen : green,
  borderRadius: 37,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: isSelected ? darkGreen : mediumGreen,
    cursor: isSelected ? 'default' : 'pointer',
  },
});

export default function Options({
  selected,
  appleType,
  locations,
  date,
  setAppleType,
  setLocations,
  setSelected,
  handleDateChange,
  chartComponent,
  isZoomed,
  thirtyZoom,
  seasonZoom,
}) {
  // If the date of interest changes, reset to initial chart zoom
  useEffect(() => {
    if (chartComponent && chartComponent.current) {
      if (isZoomed === 'doi') {
        thirtyZoom();
      }
    }
  }, [date, chartComponent]);

  return (
    <>
      <Box>
        <FormLabel color='success' sx={{ fontSize: '12.5px' }}>
          Location
        </FormLabel>
        <LocationPicker
          selected={selected}
          locations={locations}
          newLocationsCallback={(s, l) =>
            storeLocations(s, l, name, setSelected, setLocations)
          }
          token={token}
          bbox={bbox}
          allowedStates={allowedStates}
          modalZIndex={1}
        />
      </Box>

      <TextField
        color='success'
        type='date'
        label='Date of Interest'
        value={date}
        onChange={handleDateChange}
        InputProps={{
          inputProps: {
            max: format(new Date(), 'yyyy-MM-dd'),
          },
        }}
        variant='standard'
      />

      <FormControl>
        <FormLabel color='success' id='apple-type' sx={{ fontSize: '12.5px' }}>
          Apple Type
        </FormLabel>
        <RadioGroup
          aria-labelledby='apple-type'
          value={appleType}
          onChange={(e) => setAppleType(e.target.value)}
        >
          {Object.keys(appleTypes).map((name) => (
            <FormControlLabel
              key={name}
              value={name}
              control={<Radio size='small' sx={radioSX} />}
              label={name}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Button sx={btnSX(isZoomed === 'doi')} onClick={thirtyZoom}>
        30-Day Results
      </Button>

      <Button sx={btnSX(isZoomed === 'season')} onClick={seasonZoom}>
        Season To Date
      </Button>
    </>
  );
}

Options.propTypes = {
  selected: PropTypes.string,
  appleType: PropTypes.string,
  locations: PropTypes.object,
  date: PropTypes.string,
  setAppleType: PropTypes.func,
  setLocations: PropTypes.func,
  setSelected: PropTypes.func,
  handleDateChange: PropTypes.func,
  chartComponent: PropTypes.object,
  isZoomed: PropTypes.string,
  thirtyZoom: PropTypes.func,
  seasonZoom: PropTypes.func,
};
