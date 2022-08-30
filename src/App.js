import React, { useState, useEffect } from 'react';
import { format, parseISO, isWithinInterval } from 'date-fns';

import {
  Box,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

import { getData, appleTypes } from './Scripts/getData';
import {
  allowedStates,
  bbox,
  name,
  token,
  storeLocations
} from './Components/LocationPicker/LocationVariables';

import LocationPicker from './Components/LocationPicker/LocationPicker';
import Chart from './Components/Chart/Chart';
import Loading from './Components/Loading';

const green = '#0B0';
const radioSX = {
  marginLeft: '8px',
  marginBottom: '3px',
  padding: '5px',
  color: green,
  '&.Mui-checked': {
    color: green,
  }
};





function App() {
  const [appleType, setAppleType] = useState(Object.keys(appleTypes)[0]);
  const [data, setData] = useState({});
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [locations, setLocations] = useState(() => {
    const stored = localStorage.getItem(`${name}.locations`);
    return stored ? JSON.parse(stored) : {};
  });
  const [selected, setSelected] = useState(JSON.parse(localStorage.getItem(`${name}.selected`)) || '');


  // Update data when selected location or date of interest change
  useEffect(() => {
    updateData(date);
  }, [selected]);
  
  
  // Handles getting the data for the chart
  const updateData = async (doi) => {
    if (selected) {
      setData({});
    
      // Get list of thresholds from apple definitions
      const thresholds = Object.values(appleTypes).reduce((acc, obj) => {
        if (!acc.includes(obj.threshold)) acc.push(obj.threshold);
        return acc;
      }, []);
    
      const newData = await getData([locations[selected].lng, locations[selected].lat], doi, thresholds, 43);
      setData(newData);
    }
  };

  // Handles whether to update data on date change or not then sets the new date in state
  const handleDateChange = async (e) => {
    const newDateStr = e.target.value;
    const newDate = parseISO(newDateStr);
    
    if (!isWithinInterval(newDate, {
      start: parseISO(data.dates[0]),
      end: parseISO(data.forecast.dates.length === 0 ? data.dates[data.dates.length - 1] : data.forecast.dates[data.forecast.dates.length - 1])
    })) {
      await updateData(newDateStr);
    }

    setDate(newDateStr);
  };


  return (
    <Box>
      <Box sx={{
        display: 'flex',
        width: 900,
        height: 400,
        border: `2px solid ${green}`,
        margin: '20px auto'
      }}>
        <Box sx={{
          width: 200,
          boxSizing: 'border-box',
          borderRight: `2px solid ${green}`,
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Box>
            <FormLabel color='success' sx={{ fontSize: '12.5px' }}>Location</FormLabel>
            <LocationPicker
              selected={selected}
              locations={locations}
              newLocationsCallback={(s, l) => storeLocations(s, l, name, setSelected, setLocations)}
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
                max: format(new Date(), 'yyyy-MM-dd')
              }
            }}
            variant='standard'
          />
          <FormControl>
            <FormLabel color='success' id='apple-type' sx={{ fontSize: '12.5px' }}>Apple Type</FormLabel>
            <RadioGroup
              aria-labelledby='apple-type'
              value={appleType}
              onChange={(e) => setAppleType(e.target.value)}
            >
              {Object.keys(appleTypes).map(name => <FormControlLabel key={name} value={name} control={<Radio size='small' sx={radioSX} />} label={name} />)}
            </RadioGroup>
          </FormControl>
        </Box>
        <Box sx={{
          width: 700
        }}>
          {Object.keys(data).length === 0 ?
            <Loading />
            :
            <Chart
              appleType={appleType}
              applePhenology={appleTypes[appleType].phenology}
              dates={data.dates}
              dateOfInterest={date}
              forecast={{ dates: data.forecast.dates, minTemps: data.forecast.minTemps, gdds: data.forecast[`thresh${appleTypes[appleType].threshold}`]}}
              gdds={data[`thresh${appleTypes[appleType].threshold}`]}
              loc={locations[selected].address}
              minTemps={data.minTemps}
            />
          }
        </Box>
      </Box>
    </Box>
  );
}

export default App;