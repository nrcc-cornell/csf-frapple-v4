import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, isWithinInterval } from 'date-fns';

import { Box } from '@mui/material';

import { getData, appleTypes } from './Scripts/getData';
import { name } from './Components/LocationPicker/LocationVariables';
import useWindowWidth from './Hooks/useWindowWidth';

import Chart from './Components/Chart/Chart';
import Loading from './Components/Loading';
import Options from './Components/Options/Options';
import OptionsPopper from './Components/OptionsPopper/OptionsPopper';

const green = '#0B0';

function App() {
  const [appleType, setAppleType] = useState(Object.keys(appleTypes)[0]);
  const [data, setData] = useState({});
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [locations, setLocations] = useState(() => {
    const stored = localStorage.getItem(`${name}.locations`);
    return stored ? JSON.parse(stored) : {};
  });
  const [selected, setSelected] = useState(
    JSON.parse(localStorage.getItem(`${name}.selected`)) || ''
  );
  const [isZoomed, setIsZoomed] = useState('doi');
  const chartComponent = useRef(null);
  const windowWidth = useWindowWidth();

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

      const newData = await getData(
        [locations[selected].lng, locations[selected].lat],
        doi,
        thresholds,
        43
      );
      setData(newData);
    }
  };

  // Handles changing to 30-day zoom around date of interest
  const thirtyZoom = () => {
    if (chartComponent && chartComponent.current) {
      const datesArr = chartComponent.current.chart.xAxis[0].categories;
      const iOfDOI = datesArr.findIndex((d) => d === date);

      // if iOfDOI is too close to beginning or end of season, adjust where the range starts and ends
      let end = iOfDOI + 15;
      let start = iOfDOI - 14;
      if (datesArr.length - 1 < end) {
        end = datesArr.length - 1;
        start = Math.max(0, end - 30);
      } else if (start < 0) {
        start = 0;
        end = Math.min(datesArr.length - 1, 29);
      }

      chartComponent.current.chart.xAxis[0].setExtremes(start, end);
    }
  };

  // Zoom out to show entire season
  const seasonZoom = () => {
    if (chartComponent && chartComponent.current) {
      chartComponent.current.chart.zoomOut();
    }
  };

  // Handles whether to update data on date change or not then sets the new date in state
  const handleDateChange = async (e) => {
    const newDateStr = e.target.value;
    const newDate = parseISO(newDateStr);

    if (
      !isWithinInterval(newDate, {
        start: parseISO(data.dates[0]),
        end: parseISO(
          data.forecast.dates.length === 0
            ? data.dates[data.dates.length - 1]
            : data.forecast.dates[data.forecast.dates.length - 1]
        ),
      })
    ) {
      await updateData(newDateStr);
    }

    setDate(newDateStr);
  };

  const renderOptions = () => {
    return (
      <Options
        selected={selected}
        appleType={appleType}
        locations={locations}
        date={date}
        setAppleType={setAppleType}
        setLocations={setLocations}
        setSelected={setSelected}
        handleDateChange={handleDateChange}
        isZoomed={isZoomed}
        chartComponent={chartComponent}
        thirtyZoom={thirtyZoom}
        seasonZoom={seasonZoom}
      />
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          width: 893,
          height: 400,
          border: `2px solid ${green}`,
          margin: '20px auto',
          '@media (max-width: 907px)': {
            boxSizing: 'border-box',
            width: '100%',
            flexDirection: 'column',
            height: 444,
          },
        }}
      >
        {windowWidth >= 908 ? (
          <Box
            sx={{
              width: 200,
              boxSizing: 'border-box',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
              borderRight: `2px solid ${green}`,
            }}
          >
            {renderOptions()}
          </Box>
        ) : (
          <OptionsPopper>{renderOptions()}</OptionsPopper>
        )}

        <Box
          sx={{
            width: '100%',
            '@media (min-width: 908px)': {
              width: '732px',
            },
          }}
        >
          {Object.keys(data).length === 0 ? (
            <Loading />
          ) : (
            <Chart
              appleType={appleType}
              applePhenology={appleTypes[appleType].phenology}
              dates={data.dates}
              forecast={{
                dates: data.forecast.dates,
                minTemps: data.forecast.minTemps,
                gdds: data.forecast[`thresh${appleTypes[appleType].threshold}`],
              }}
              gdds={data[`thresh${appleTypes[appleType].threshold}`]}
              loc={locations[selected].address}
              minTemps={data.minTemps}
              chartComponent={chartComponent}
              setIsZoomed={setIsZoomed}
              dateOfInterest={date}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default App;
