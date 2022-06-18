import cv2
import sys
import numpy as np

def nothing(x):
    pass

# Create a window
cv2.namedWindow('determine-threshold')

# create trackbars for color change
cv2.createTrackbar('HMin','determine-threshold',0,179,nothing) # Hue is from 0-179 for Opencv
cv2.createTrackbar('HMax','determine-threshold',0,179,nothing)
cv2.createTrackbar('SMin','determine-threshold',0,255,nothing)
cv2.createTrackbar('SMax','determine-threshold',0,255,nothing)
cv2.createTrackbar('VMin','determine-threshold',0,255,nothing)
cv2.createTrackbar('VMax','determine-threshold',0,255,nothing)

# Set default value for MAX HSV trackbars.
cv2.setTrackbarPos('HMax', 'determine-threshold', 179)
cv2.setTrackbarPos('SMax', 'determine-threshold', 255)
cv2.setTrackbarPos('VMax', 'determine-threshold', 255)

# Initialize to check if HSV min/max value changes
hMin = sMin = vMin = hMax = sMax = vMax = 0
phMin = psMin = pvMin = phMax = psMax = pvMax = 0

img = cv2.imread('sample.png')
output = img
waitTime = 33

while(1):

    # get current positions of all trackbars
    hMin = cv2.getTrackbarPos('HMin','determine-threshold')
    hMax = cv2.getTrackbarPos('HMax','determine-threshold')
    sMin = cv2.getTrackbarPos('SMin','determine-threshold')
    sMax = cv2.getTrackbarPos('SMax','determine-threshold')
    vMin = cv2.getTrackbarPos('VMin','determine-threshold')
    vMax = cv2.getTrackbarPos('VMax','determine-threshold')

    # Set minimum and max HSV values to display
    lower = np.array([hMin, sMin, vMin])
    upper = np.array([hMax, sMax, vMax])

    # Create HSV Image and threshold into a range.
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, lower, upper)
    output = cv2.bitwise_and(img,img, mask= mask)

    # Print if there is a change in HSV value
    if( (phMin != hMin) | (psMin != sMin) | (pvMin != vMin) | (phMax != hMax) | (psMax != sMax) | (pvMax != vMax) ):
        print("(hMin = %d , sMin = %d, vMin = %d), (hMax = %d , sMax = %d, vMax = %d)" % (hMin , sMin , vMin, hMax, sMax , vMax))
        phMin = hMin
        psMin = sMin
        pvMin = vMin
        phMax = hMax
        psMax = sMax
        pvMax = vMax

    # Display output image
    cv2.imshow('determine-threshold',mask)

    # Wait longer to prevent freeze for videos.
    if cv2.waitKey(waitTime) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()