
import React from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { Sensors } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getLastSensorDataFor, getPredictionsFor, getSensor } from "SensorApiClient";
import Plot from "react-plotly.js";
import Thermometer from 'react-thermometer-component';
import GaugeChart from 'react-gauge-chart';

export function timeDifference(timestamp) {

  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const current = Date.now();
  const elapsed = current - new Date(timestamp);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: "auto" });

  if (elapsed < msPerMinute) {
    return rtf.format(-Math.floor(elapsed / 1000), 'seconds');
  }

  else if (elapsed < msPerHour) {
    return rtf.format(-Math.floor(elapsed / msPerMinute), 'minutes');
  }

  else if (elapsed < msPerDay) {
    return rtf.format(-Math.floor(elapsed / msPerHour), 'hours');
  }

  else {
    return new Date(timestamp).toLocaleDateString('en');
  }
}




function LastData(props) {
  const { lastData } = props;
  return <>

    <Stack direction="row" spacing={5} m={3}>
      <Stack direction="column" justifyContent="flex-end" alignItems="center">
        <Thermometer
          theme="light"
          value={lastData.temperature}
          max="50"
          steps="1"
          format="°C"
          height="150"
        />
        <h4>Temperature</h4>
      </Stack>
      <Stack direction="column" justifyContent="flex-end" alignItems="center">
        <GaugeChart
          nrOfLevels={30}
          colors={["#333300", "#999900", "#FFFF00"]}
          arcWidth={0.3}
          percent={lastData.light / 1200}
          formatTextValue={x => Math.round(x * 12).toString()}
          textColor="#000"
        />
        <h4>Light</h4>
      </Stack>

    </Stack>
  </>;
}


export function SensorPage() {
  const { id } = useParams()
  const { isLoading, data: sensor } = useQuery(`sensors/${id}`, () => getSensor(id))
  const { isLoading: isLoadingData, data } = useQuery(`sensors/${sensor?.name}`, () => getLastSensorDataFor(sensor?.name),
    { enabled: !!sensor })
  let { isLoading: isLoadingPredictionsData, data: predictions } = useQuery(`sensors-predictions/${sensor?.name}`, () => getPredictionsFor(sensor?.name),
    { enabled: !!sensor })


  if (isLoading) return <div>Loading sensor info...</div>
  if (isLoadingData) return <div>Loading sensor data...</div>
  if (isLoadingPredictionsData) return <div>Loading predictions for sensor...</div>
  if (data.length === 0) return <div>No data found for sensor {sensor.name}</div>
  const { lastData } = sensor
  if (!predictions)
    predictions = []

  data.sort((a, b) => b.timestamp > a.timestamp)

  return <div>
    <Box m={2}>
      <Stack direction="row" alignItems="center" spacing={4} my={4}>
        <IconButton size="small" >
          <Sensors></Sensors>
        </IconButton>
        <h3>Sensor {sensor.name}</h3>
      </Stack>
      <Stack direction="row">
        <Box minWidth={'300px'}>
          <Stack direction="row" spacing={2}>
            <Box minWidth={100}><Typography variant="caption">Room</Typography></Box>
            <Box><Typography variant="body1">{sensor.area}</Typography></Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Box minWidth={100}><Typography variant="caption">Description</Typography></Box>
            <Box><Typography variant="body1">{sensor.description}</Typography></Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Box minWidth={100}><Typography variant="caption">Last info</Typography></Box>
            <Box><Typography variant="body1">{timeDifference(lastData.inserted)}</Typography></Box>
          </Stack>
        </Box>
        <Box>
          <LastData lastData={lastData}></LastData>
        </Box>
      </Stack>

      <Box my={1}>
        <h3 >Evolution of the data</h3>
      </Box>

      <Plot
        data={[
          {
            x: data.map(x => x.timestamp),
            y: data.map(x => x.temperature),
            name: 'Real',
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'red' },
          },
          {
            x: predictions.map(x => x.timestamp),
            y: predictions.map(x => x.temperature),
            name: 'Predicted',
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'orange' },
          },

        ]}
        layout={{ width: 1000, height: 400, title: 'Temperature' }}
      />
      <Plot
        data={[

          {
            x: predictions.map(x => x.timestamp),
            y: predictions.map(x => x.temperature),
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'orange' },
          },

        ]}
        layout={{ width: 1000, height: 400, title: 'Zoom in on Temperature Predictions' }}
      />
      <Plot
        data={[
          {
            x: data.map(x => x.timestamp),
            y: data.map(x => x.light),
            name: 'Real',
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'blue' },
          }, {
            x: predictions?.map(x => x.timestamp),
            y: predictions.map(x => x.light),
            name: 'Predicted',
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'orange' },
          },

        ]}
        layout={{ width: 1000, height: 400, title: 'Light' }}
      />
    </Box>

  </div>
    ;
}