# import the opencv library
import cv2
from cv2 import MORPH_ELLIPSE
from cv2 import MORPH_OPEN
import numpy as np

cameraOnly = False
class RobotArmDetector:
    def __init__(self, debug= False):
        super().__init__()
        self.debug = debug
        self.video = cv2.VideoCapture(0)
        self.__target_location = (0.7,0.7)
    
    def show_video(self):
        while(True):
            ret, frame = self.video.read()
            cv2.imshow('video', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    def release_video(self):
        self.video.release()
        cv2.destroyAllWindows()


    def get_target_location(self):
        return self.__target_location
    
    def get_current_arm_end_coordinates(self,waitForKey=False):
        return self.__get_current_arm_end_coordinates(0, waitForKey)
    
    def __get_current_arm_end_coordinates(self,attempt=0, waitForKey=False):
        ret, frame = self.video.read()
        result = self.get_arm_end_coordinates(frame)
        
        if (result[0] == None and attempt < 2):
            self.__get_current_arm_end_coordinates(attempt+1, waitForKey) 
        
        if (waitForKey):
            #self.__save_sample(frame)
            while(1):
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        return result
    
    def update_target_location_from_mouse_click(self,event,x,y,flags,param):
        if event == cv2.EVENT_LBUTTONDBLCLK:
            self.__target_location = (x/self.width, y/self.height)
       
    def __find_biggest_contour_index(self, contours): 
        return np.argmax(list(map(lambda x: cv2.contourArea(x),contours)))

    def __create_arm_mask(self, image_hsv, show_bounding_box = False):
        image_onlyblack =cv2.inRange(image_hsv, np.array([0,0,0]),np.array([179,255,40]))
        self.__show_image('hsv-onlyblack', image_onlyblack)
        
        element = cv2.getStructuringElement(MORPH_ELLIPSE,(5,5))
        temp =cv2.dilate(image_onlyblack, element)
        self.__show_image('onlyblack-morphed', temp)
        
        contours, hierarchy = cv2.findContours(temp, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        biggest_contour_index = self.__find_biggest_contour_index(contours)
        
        blank = np.zeros(image_hsv.shape, dtype='uint8')
        if show_bounding_box:
            x,y,w,h = cv2.boundingRect(contours[biggest_contour_index])
            blank = cv2.rectangle(blank,(x,y),(x+w,y+h),(0,255,0),1)
        result = cv2.drawContours(blank,contours,biggest_contour_index,(255,255,255),-1)
        self.__show_image('arm-mask', result)
        return result

    def __get_sticker_coordinates(self,image_robotarm):
        image_sticker = cv2.inRange(image_robotarm, np.array([155,100,90]),np.array([179,255,255]))
        self.__show_image('sticker', image_sticker)
        element = cv2.getStructuringElement(MORPH_ELLIPSE,(3,3))
        image_sticker = cv2.morphologyEx(image_sticker,MORPH_OPEN, element)
        self.__show_image('sticker-morphed', image_sticker)
        
        contours, hierarchy = cv2.findContours(image_sticker, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        if (len(contours) > 0):
            biggest_contour_index = self.__find_biggest_contour_index(contours)
            M = cv2.moments(contours[biggest_contour_index])
            cX = int(M["m10"] / M["m00"])
            cY = int(M["m01"] / M["m00"])
            return (cX,cY)
        
        return (None,None)

    def put_info(self, distance, reward):
        self.__show_image('spotted', cv2.putText(self.final_image, f'target: {self.__target_location[0]:3.2},{self.__target_location[1]:3.2}, arm: {self.position[0]:3.2},{self.position[1]:3.2}, distance:{distance:3.3}, reward: {reward}',
            (10,30),cv2.FONT_HERSHEY_COMPLEX,0.5,(255,255,0)))
        self.__show_image('spotted', self.final_image)
        cv2.setMouseCallback('spotted',self.update_target_location_from_mouse_click)
        
    def get_arm_end_coordinates(self,image):
        image_hsv = cv2.cvtColor(image,cv2.COLOR_BGR2HSV)
        mask = self.__create_arm_mask(image_hsv, False)
        self.height = image_hsv.shape[0]
        self.width = image_hsv.shape[1]
        image_robotarm = cv2.bitwise_and(image_hsv,mask)
        self.__save_sample(image_robotarm)
        self.__show_image('robot-arm', image_robotarm)
        
        cX, cY = self.__get_sticker_coordinates(image_hsv)
        if (cX == None or cY == None):
            print('Could not find arm end coordinates, returning defaults...')
            cX = self.width // 2
            cY = self.height // 2
        final = cv2.circle(image, (cX, cY), 5, (0, 255, 255), -1)
        target = self.get_target_location()
        self.final_image = cv2.circle(image, (int(target[0] * self.width), int(target[1] * self.height)), 5, (0, 0, 255), -1)
        self.position = (cX/self.width, cY/self.height)
        return self.position
    
    def __save_sample(self, image, filename='sample.png'):
        if (self.debug):
            cv2.imwrite(filename,cv2.cvtColor(image,cv2.COLOR_HSV2BGR))

    def __show_image(self,label,image):
        if (self.debug):
            cv2.imshow(label,image)
            cv2.waitKey(10)

# You can set the debug flag to true to show images
# detector = RobotArmDetector()

# Use show_video to position the robot arm
# detector.show_video()

# use the wait for key parameter to wait until a key is pressed
# x,y = detector.get_current_arm_end_coordinates(True)
# print(y)