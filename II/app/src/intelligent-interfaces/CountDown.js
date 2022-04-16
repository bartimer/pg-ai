import { round } from "@tensorflow/tfjs-core";
import React, { useContext } from "react";
import { useInterval } from "useInterval";
import { useCustomContext } from "./CustomContext";

export function CountDown(){
 const {state, dispatch} = useCustomContext()
 useInterval(()=>{
     if (state.gameState.isStarted())
     dispatch({type:'count-down'});
 },1000)
 useInterval(()=>{
    if (state.gameState.isStarted() && state.currentRound?.captureFinished)
    dispatch({type:'count-down-in-between'});
},1000)

if (state.gameState.isFinished()) 
    return <>
    {state.computerWins < state.playerWins && <h3>Congrats! You won with {state.playerWins} - {state.computerWins}</h3>}
    {state.computerWins > state.playerWins && <h3>Aarghh! The computer won with {state.computerWins} - {state.playerWins}</h3>}
    <h3>The end</h3>
    </>
if (!state.gameState.isStarted()) 
    return <></>
if (state.currentRound?.captureFinished) 
    return <>
    <h3>Next round in <b>{state.currentRound?.timeBeforeNextRound}</b> sec.</h3>
    </>
if (state.currentRound?.captureAction) 
    return <>
        <h3>Show your move</h3>
    </>
return <>
    <h3>Get ready in <b>{state.currentRound.countDown}</b> sec.</h3>
</>
}