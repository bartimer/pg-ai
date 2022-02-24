import {Typography } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { getLastSensorData, getSensors } from "SensorApiClient";
import {Sensor} from './Sensor';




export function Branch(){
    const { isLoading, error, data: sensors } = useQuery('sensors', () => getSensors())
    const { isLoading: isLoadingLastSensorData, error: errorLastSensorData, data: lastSensorData } = useQuery('last-sensor-data', () => getLastSensorData())
   if (isLoading || isLoadingLastSensorData) return 'Loading the data for the sensors...'
 
   if (error || errorLastSensorData) return 'An error has occurred: ' + error?.message ?? errorLastSensorData.message
    return <>
        <h3>Branch Anderlecht KAAI</h3>
        <Typography>This is the floor plan of the Anderlecht KAAI branch. Click on the sensors to get more details about specific temperatures</Typography>

        <div className='layout' style={{width:'600px', height:'1000px'}}>
            {
            sensors.map((x) => <Sensor key={x.id} sensor={x} lastData={lastSensorData.find(d => d.device === x.name)}></Sensor>)}
    </div>
    </>
}