import React, { useEffect, useReducer, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import { drawHand } from "./Drawing";
import { gestures } from "./Gestures";
import { GestureEstimator } from "fingerPoseEstimator";
import { useInterval } from "useInterval";
import { gameReducer, initialState } from "./GameReducer";
import CustomContext from "./CustomContext";
import { CountDown } from "./CountDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScoreBoard } from "./ScoreBoard";
import { Box, Button, Container } from "@mui/material";

const detectorConfig = {
  runtime: 'tfjs', // or 'tfjs'
  modelType: 'full',
  maxHands:1
};

export function RockPaperScissor(){
    const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [resultingGesture, setResultingGesture] = useState('');
  const [detector, setDetector] = useState(null);
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const providerState = {
    state, dispatch
  }
  let gestureCount = 0;
  const defaultGestures = {'rock':[],'paper':[], 'scissors':[]};
  let lastGestures = {...defaultGestures};
  const gestureEstimator = new GestureEstimator(gestures);  
useEffect(() => {
  const createDetector = async() => {
    const s = await handPoseDetection.createDetector(model, detectorConfig);
    setDetector(s);
  } 
  createDetector();
  
},[])
useInterval(async ()=>{
  if (!detector)
    return;
  
  const hands = await detect(detector);
  if (!state.currentRound?.captureAction || state.currentRound?.captureFinished)
    return;
  if (hands?.length > 0){
      
      const gestureEstimations = gestureEstimator.estimate(
          hands[0].keypoints3D, 0.5
        );
        
        if(gestureEstimations.gestures.length > 0) {
          
          if (gestureCount < 4){
            gestureCount++;
            gestureEstimations.gestures.map(x =>{
              lastGestures[x.name].push(x.score);
            })
          } else {
            const g = getMostLikely(lastGestures);
            //console.log("last gestures:",lastGestures);
            setResultingGesture(g);
            gestureCount = 0;
            lastGestures = {'rock':[],'paper':[], 'scissors':[]};
            dispatch({type:'make-move',payload:{move:g}})
            //console.log("resulting gesture:",g);
            
          }
          
        }
  }
}, 20)
const getMostLikely  = list => {
  let best = 'rock';
  const sum = arr => arr.reduce((a, b) => a + b, 0)
  for (const [key, value] of Object.entries(list)) {
    if (sum(value) > sum(list[best]))
      best = key
  }
  return best;
}

const detect = async (net) => {
  if (!net) return null;
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      if (canvasRef?.current){
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
    }
      // Make Detections
      const hand = await net.estimateHands(video,{flipHorizontal:false});
      //console.log(hand);

      // Draw mesh
       const ctx = canvasRef.current?.getContext("2d");
       if (ctx && hand)
        drawHand(hand, ctx);
        return hand;
    }
  };
  


    return <CustomContext.Provider value={providerState} >
        
        <Container>
        {!state.started && <Button onClick={() => dispatch({type:'start'})}>Start game</Button>}
        <Box display="flex" direction="row" justifyContent="space-between" alignItems="center">
        
        <div style={{width:640,height:480}}>
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        </div>
        <div><CountDown></CountDown></div>
        </Box>
        
        <ScoreBoard></ScoreBoard>
        </Container>
    </CustomContext.Provider>
}