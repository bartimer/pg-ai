
import React from "react";
import { Alert, Badge, IconButton, Stack, Tooltip, tooltipClasses, Typography } from "@mui/material";
import { makeStyles, styled } from "@mui/styles";
import { AutoGraph, LightMode, Sensors, Thermostat, Warning } from "@mui/icons-material";
import { Link } from "react-router-dom";



const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: '12px',
    border: '1px solid #dadde9',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: -2,
    padding: '0 4px',
  },
}));

export function Sensor(props) {
  const useStyles = makeStyles({
    pulse: {
      backgroundColor: 'transparent',
      borderRadius: "50%",
      margin: 2,
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 1)",
      transform: "scale(1)",
      animation: "$pulse 2s infinite"
    },
    "@keyframes pulse": {
      "0%": {
        transform: "scale(0.95)",
        boxShadow: "0 0 0 0 rgba(0, 0, 0, 0.7)"
      },
      "70%": {
        transform: "scale(1)",
        boxShadow: "0 0 0 8px rgba(0, 0, 0, 0)"
      },
      "100%": {
        transform: "scale(0.95)",
        boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)"
      }
    }
  });
  const classes = useStyles();
  const { sensor, lastData } = props;
  
  const format = (v) => `${v}px`;
  
  const notWorking = (new Date().getTime() - new Date(lastData.inserted).getTime()) / (1000 * 60 * 60) > 1


  return <div className="sensor-container" style={{ top: format(sensor.y), left: format(sensor.x) }}>
    <div>
      <HtmlTooltip title={
        <div>
          <h3>{sensor.name} <IconButton size="small" component={Link} to={`/sensors/${sensor.id}`}>
            <AutoGraph></AutoGraph>
          </IconButton></h3>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>

              <Typography variant="caption">{sensor.description}</Typography>
            </Stack>
            {
              notWorking && <Alert severity="warning"> No data in last hour</Alert>

            }
            <Stack direction="row" spacing={2}>
              <Thermostat></Thermostat>
              <Typography>{lastData.temperature}</Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <LightMode></LightMode>
              <Typography>{lastData.light}</Typography>
            </Stack>
          </Stack>


        </div>}>
        <IconButton size="small" className={classes.pulse} color={notWorking ? 'warning' : 'primary'}>
          {!notWorking && <Sensors></Sensors>}
          {
          notWorking &&
            <StyledBadge badgeContent={<Warning fontSize="small"></Warning>} color="warning">
              <Sensors></Sensors>
            </StyledBadge>
          }
        </IconButton>
      </HtmlTooltip>

    </div>
  </div>;
}