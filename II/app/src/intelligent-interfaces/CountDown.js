import { round } from "@tensorflow/tfjs-core";
import React, { useContext } from "react";
import { useInterval } from "useInterval";
import { useCustomContext } from "./CustomContext";

export function CountDown(){
 const {state, dispatch} = useCustomContext()
 useInterval(()=>{
     if (state.started)
     dispatch({type:'count-down'});
 },1000)
 useInterval(()=>{
    if (state.started && state.currentRound?.captureFinished)
    dispatch({type:'count-down-in-between'});
},1000)
if (!state.started) 
    return <></>
if (state.finished) 
    return <><h3>End of game</h3></>
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