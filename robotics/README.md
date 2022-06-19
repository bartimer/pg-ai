# Assigment: Use reinforcement learning to move a robot arm to a wanted position
The goal of the assigment in to move a robot arm to a certain position in a safe way learned through RL. 

We use an [Adeept robot arm](http://www.adeept.com/robotic-arm-uno_p0118.html).

![Adeept robot arm](./images/adeept-robotarm.jpg)

## Object detection ([RobotArmDetector.py](RobotArmDetector.py))
The positon of robot arm is determined through object detection of a camera image. The openCV library is used for this.
We will determine the object by filtering colors based on their HSV values. 
We start by detecting the complete robot arm which we use as a mask for the complete image, then we search for a red sticker within this masked image and determine the centroid of that sticker (by using moments). Implementation is done in the `RobotArmDetector.py`.

![Detection Process](./images/allmasks-withtext.jpg)

On the image above you can see the different steps that eventually produce a large enough area white area that represents the sticker. By finding the contours of this sticker, we're able get the location of the end of the robot arm.

To be able to visually follow the learning process, we mark the determined location with a yellow dot on the original image.

The target location is marked with a red dot.

![Image with current and target location](./images/result.jpg)

The locations are normalized ranging from (0,0) to (1,1)

## Controlling the robot ([RobotArmController.py](RobotArmController.py))
The position of the robot arm is controlled by servo motors. Each servo motor has a 180 degrees range. 

We will work in a 2D space and therefore only use the servo 1 and 2. A servo is set into a position by specifying the desired angle of the servo.

Because the stable baselines agents perform better within an normalized action space, a movement is translated from a (-1,1) action range into an angle. To avoid very large rotations at once, the change in angle per movement is limited to 10 degrees.

The action of the environment will be thin the From the `RobotArmController`, the `move_servos()`


