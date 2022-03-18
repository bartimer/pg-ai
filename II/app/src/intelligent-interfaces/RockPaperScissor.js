import React, { useRef } from "react";
import Webcam from "react-webcam";
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import { drawHand } from "./Drawing";
import { gestures } from "./Gestures";
import { GestureEstimator } from "fingerPoseEstimator";

export function RockPaperScissor(){
    const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
const detectorConfig = {
  runtime: 'tfjs', // or 'tfjs'
  modelType: 'full',
  maxHands:1
};


const createDetector = async() => {
    const detector = await handPoseDetection.createDetector(model, detectorConfig);
    
    const gestureEstimator = new GestureEstimator(gestures);
    setInterval(async ()=>{
        const hands = await detect(detector);
        if (hands?.length > 0){
            console.log(hands);
            const gestureEstimations = gestureEstimator.estimate(
                hands[0].keypoints3D, 0.1
              );
              
              if(gestureEstimations.gestures.length > 0) {
                
                // 3. extract gesture with highest match score
                const gestureResult = gestureEstimations.gestures.reduce(
                  (p, c) => { return (p.score > c.score) ? p : c; }
                );
                console.log("gesture:", gestureResult.name);
                return gestureResult.name;
              }
        }
    },1000)
}

const detect = async (net) => {
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
      console.log(hand);

      // Draw mesh
       const ctx = canvasRef.current?.getContext("2d");
       if (ctx && hand)
        drawHand(hand, ctx);
        return hand;
    }
  };

createDetector();

// const estimationConfig = {flipHorizontal: false};
// const hands = await detector.estimateHands(image, estimationConfig);
    return <>
        <h4>Rock paper scissors</h4>
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
    </>
}