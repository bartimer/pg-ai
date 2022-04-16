import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Grid, Rating, Stack, Typography } from "@mui/material";
import { round } from "@tensorflow/tfjs-core";
import React, { useContext } from "react";
import { useInterval } from "useInterval";
import { useCustomContext } from "./CustomContext";

export function MoveIcon(props){
    const {move} = props;
    const icon = `fa-solid ${move === 'rock' ? 'fa-hand-back-fist' : move === 'scissors' ? 'fa-hand-scissors' : 'fa-hand'}`
    return <FontAwesomeIcon icon={icon} size="3x">

    </FontAwesomeIcon>
}


export function ScoreBoard(){
 const {state, dispatch} = useCustomContext()
 
if (!state.gameState.isStarted()) return <></>
return <div>
<Box display="flex" justifyContent="flex-start" flexDirection="column" alignItems="center" p={3}>

    <Box display="flex" justifyContent="space-between" flexDirection="row" width="100%" p={3}>
    <Box>
        <Stack>
        <Typography variant="h5">Computer</Typography>
        <Box>
        <Rating value={state.computerWins} max={state.numberOfRounds} readOnly/>
        </Box>
        <Box m={2}>
        {state.currentRound?.winner && <MoveIcon move={state.currentRound.computerMove}/>}
        </Box>
        
        </Stack>
    </Box>
    <Box>
        <Typography variant="h5">You</Typography>
        <Box>
        <Rating value={state.playerWins} max={state.numberOfRounds} readOnly/>
        </Box>
        <Box m={2}>
        {state.currentRound?.winner && <MoveIcon move={state.currentRound.playerMove}/>}
        </Box>
    </Box>
    
    </Box><Box>
    {state.currentRound?.winner && 
        <Typography variant="h3">{state.currentRound?.winner === 'player' ? 'You win': state.currentRound?.winner === 'computer' ? 'Sorry, you lose!': 'Great minds think alike...'}</Typography>
    }
    </Box>
</Box>
</div>
}