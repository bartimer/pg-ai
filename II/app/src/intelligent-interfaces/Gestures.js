
import * as fp from 'fingerpose';

// create new gesture with id "rock"
const RockGesture = new fp.GestureDescription('rock');

// all fingers must be curled
RockGesture.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl);
RockGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl);
RockGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl);
RockGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl);

RockGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl);
//RockGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl);

const PaperGesture = new fp.GestureDescription('paper');
PaperGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl);
PaperGesture.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl);
PaperGesture.addCurl(fp.Finger.Ring,  fp.FingerCurl.NoCurl);
PaperGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl);
PaperGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl);
PaperGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl);

const ScissorsGesture = new fp.GestureDescription('scissors');

// index and middle finger: stretched out
ScissorsGesture.addCurl(fp.Finger.Index,  fp.FingerCurl.NoCurl);
ScissorsGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl);

// ring: curled
ScissorsGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl);
//ScissorsGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.HalfCurl);

// pinky: curled
ScissorsGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl);
//ScissorsGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl);

export const gestures = [RockGesture, PaperGesture, ScissorsGesture];