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
import { ScoreBoard } from "./ScoreBoard";
import { Box, Button, Container, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import * as faceapi from '@vladmandic/face-api';
import * as speech from "@tensorflow-models/speech-commands"
import { Spinner } from "./Spinner";

const detectorConfig = {
  runtime: 'tfjs', // or 'tfjs'
  modelType: 'full',
  maxHands: 1
};
const numberOfRounds = {
  'one': 1,
  'two': 2,
  'tree': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
};

function loadLabeledImages() {
  const labels = ['Yoeri', 'Els', 'Bart','Padin','Johan']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      const img = await faceapi.fetchImage(`${process.env.PUBLIC_URL}/logo192.png`)
      for (let i = 1; i <= 2; i++) {
        // console.log(`Loading ${base_url}/${label}/${i}.jpg`)
        const img = await faceapi.fetchImage(`${process.env.PUBLIC_URL}/labeledimages/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        // console.log(detections.descriptor)
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}


export function RockPaperScissor() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [resultingGesture, setResultingGesture] = useState('');
  const [detector, setDetector] = useState(null);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down('sm'));
  const [speechModel, setSpeechModel] = useState(null);
  const [isInitialState, setIsInitialState] = useState(true)
  const [action, setAction] = useState(null)
  const [labels, setLabels] = useState(null)
  const providerState = {
    state, dispatch
  }
  let gestureCount = 0;
  const defaultGestures = { 'rock': [], 'paper': [], 'scissors': [] };
  let lastGestures = { ...defaultGestures };
  const gestureEstimator = new GestureEstimator(gestures);


  // 2. Create Recognizer
  const createSpeechModel = async () => {
    const recognizer = await speech.create("BROWSER_FFT")
    
    await recognizer.ensureModelLoaded();
    console.log('Speech model loaded');
    console.log(recognizer.wordLabels());
    setSpeechModel(recognizer);
    setLabels(recognizer.wordLabels());
  }
  const createDetector = async () => {
    const s = await handPoseDetection.createDetector(model, detectorConfig);
    setDetector(s);
  }
  const createFaceDescriptors = async () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(`${process.env.PUBLIC_URL}/models`),
      faceapi.nets.faceLandmark68Net.loadFromUri(`${process.env.PUBLIC_URL}/models`),
      faceapi.nets.faceRecognitionNet.loadFromUri(`${process.env.PUBLIC_URL}/models`),
      faceapi.nets.ssdMobilenetv1.loadFromUri(`${process.env.PUBLIC_URL}/models`),
      faceapi.nets.faceExpressionNet.loadFromUri(`${process.env.PUBLIC_URL}/models`)
    ]).then(async () => {
      console.log("Start creating Face Descriptors.")
      const s = await loadLabeledImages();
      console.log("Created Face Descriptors.")
      const faceMatcher = new faceapi.FaceMatcher(s, 0.6)
      setFaceMatcher(faceMatcher);
      console.log("Created FaceMatcher.")
    })

  }

  const loadModels = async () => {
    dispatch({'type': 'start-loading'});
    await createDetector();
    await createFaceDescriptors();
    await createSpeechModel();
    dispatch({'type': 'stop-loading'});
  }

  useEffect(() => {
    loadModels();
  }, [])

  useInterval(async () => {
    if (!detector)
      return;

    const hands = await detect(detector);
    if (!state.currentRound?.captureAction || state.currentRound?.captureFinished)
      return;
    if (hands?.length > 0) {

      const gestureEstimations = gestureEstimator.estimate(
        hands[0].keypoints3D, 0.5
      );

      if (gestureEstimations.gestures.length > 0) {

        if (gestureCount < 4) {
          gestureCount++;
          gestureEstimations.gestures.map(x => {
            lastGestures[x.name].push(x.score);
          })
        } else {
          const g = getMostLikely(lastGestures);
          //console.log("last gestures:",lastGestures);
          setResultingGesture(g);
          gestureCount = 0;
          lastGestures = { 'rock': [], 'paper': [], 'scissors': [] };
          dispatch({ type: 'make-move', payload: { move: g } })
          //console.log("resulting gesture:",g);

        }

      }
    }
  }, state.handRecognitionInterval)

  useInterval(async () => {
    if (!faceMatcher || !webcamRef?.current?.video)
      return;
    const displaySize = { width: webcamRef.current.video.videoWidth, height: webcamRef.current.video.videoHeight };
    faceapi.matchDimensions(canvasRef.current, displaySize);

    const detection = await faceapi.detectSingleFace(webcamRef.current.video).withFaceLandmarks().withFaceDescriptor();
    if (!detection) {
      dispatch({ type: 'change-detected-face', payload: { face: null } });
      canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      return;
    }

    const resizedDetection = faceapi.resizeResults(detection, displaySize);
    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    let box = resizedDetection.detection.box;
    box = box.shift(-(box.x - (displaySize.width - box.x - box.width)), 0);
    const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString() });
    canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawBox.draw(canvasRef.current);
    
    dispatch({ type: 'change-detected-face', payload: { face: bestMatch.label } });
    if (!state.startedListeningForYesNo)
      recognizeCommands()

  }, state.faceRecognitionInterval)

  const getMostLikely = list => {
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
    
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      if (canvasRef?.current) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }
      
      const hand = await net.estimateHands(video, { flipHorizontal: true });
      
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && hand)
        drawHand(hand, ctx);
      return hand;
    }
  };

  function argMax(arr) {
    return arr.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
  }


  const recognizeCommands = async () => {
    if (speechModel.isListening()){
      console.log('Already listening for commands'); 
      return; 
    }
    console.log('Start listening for commands');
    
    speechModel.listen(result => {

      const action = labels[argMax(Object.values(result.scores))];
      console.log(action);
      setAction(action)
    }, { includeSpectrogram: true, probabilityThreshold: 0.9 })
  }



  useEffect(() => {
    if ((state.gameState.isIdle() || state.gameState.isFinished()) && action === 'yes') {
      dispatch({ type: 'start' });
      return;
    }
    if (state.gameState.isWantsToPlay() && Object.keys(numberOfRounds).includes(action) > -1) {
      dispatch({ type: 'change-number-of-rounds', payload: { numberOfRounds: numberOfRounds[action] } });
      speechModel.stopListening();
    }
  }, [action])


  return <CustomContext.Provider value={providerState} >
    <Spinner></Spinner>
    <Container>
      {
        ((state.gameState.isIdle() || state.gameState.isFinished()) && !state.faceDetected) && <>
          <Typography>Waiting for a playing buddy....</Typography>
        </>
      }
      {((state.gameState.isIdle() || state.gameState.isFinished()) && state.faceDetected) && <>

        <Button onClick={() => dispatch({ type: 'start' })}>Hello {state.faceDetected === 'unknown' ? 'stranger' : state.faceDetected}, Want to play a game? [Say YES]</Button>
      </>}
      {(state.gameState.isWantsToPlay()) && <Button onClick={() => dispatch({ type: 'change-number-of-rounds', payload: { numberOfRounds: 3 } })}>How many rounds to you want to play? [Number from 1 to 9]</Button>}
      <Stack>
        <Box textAlign="center"><CountDown></CountDown></Box>
        <ScoreBoard></ScoreBoard>
        <div style={{ position: 'relative' }}>
          <Webcam
            ref={webcamRef}
            mirrored={true}
            audio={false}
            videoConstraints={{ width: small ? 450 : 640, facingMode: 'user' }}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 9,
              width: small ? 450 : 640,

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
              width: small ? 450 : 640,

            }}
          />
        </div>

      </Stack>


    </Container>
  </CustomContext.Provider>
}