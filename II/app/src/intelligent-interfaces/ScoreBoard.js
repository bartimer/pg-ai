import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Grid, Rating, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { round } from "@tensorflow/tfjs-core";
import React, { useContext } from "react";
import { useInterval } from "useInterval";
import { useCustomContext } from "./CustomContext";

export function MoveIcon(props){
    const {move} = props;
    const icon = `fa-solid ${move === 'rock' ? 'fa-hand-back-fist' : move === 'scissors' ? 'fa-hand-scissors' : 'fa-hand'}`
    return <FontAwesomeIcon icon={icon} size="2x">

    </FontAwesomeIcon>
}


export function ScoreBoard(){
 const {state, dispatch} = useCustomContext()
 const theme = useTheme();
 const small = useMediaQuery(theme.breakpoints.down('md'));
 
if (!state.gameState.isStarted() && ! state.gameState.isFinished()) return <></>
return <div>


    <Box display="flex" justifyContent="space-evenly" flexDirection={small ? 'column' : 'row'} alignItems="center" width="100%" p={1}>
    <Box>
        <Stack alignItems="center">
            <Box display="flex" justifyContent="flex-start" flexDirection="row" alignItems="center">
            <Typography variant="h5" pr={2}>Computer</Typography> {state.currentRound?.winner && <MoveIcon  move={state.currentRound.computerMove}/>}
            </Box>
        
        <Box>
        <Rating value={state.computerWins} max={state.numberOfRounds} readOnly/>
        </Box>
        
        </Stack>
    </Box>
    <Box>
    {state.currentRound?.winner && 
        <Typography variant="body1">{state.currentRound?.winner === 'player' ? 'You win': state.currentRound?.winner === 'computer' ? 'Sorry, you lose!': 'Great minds think alike...'}</Typography>
    }
    </Box>
    <Box>
    <Stack alignItems="center">
        <Box display="flex" justifyContent="flex-start" flexDirection="row" alignItems="center">
        <Typography variant="h5" pr={2}>You</Typography> {state.currentRound?.winner && <MoveIcon  move={state.currentRound.playerMove}/>}  
        </Box>
        <Box>
        <Rating value={state.playerWins} max={state.numberOfRounds} readOnly/>
        </Box>
        </Stack>
    </Box>
    
    </Box>

</div>
}