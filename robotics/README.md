# Assigment: Use reinforcement learning to move a robot arm to a wanted position
The goal of the assigment in to move a robot arm to a certain position in a safe way. 

## Object detection
The positon of robot arm is determined through object detection of a camera image. The openCV library is used for this.
We will determine the object by filtering colors based on their HSV values. 
We start by detecting the complete robot arm which we use as a mask for the complete image, then we search for a red sticker within this masked image and determine the centroid of that sticker (by using moments).


