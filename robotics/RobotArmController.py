import serial
import serial.tools.list_ports as list
import json
import time
import numpy as np

PIN_OUTPUT = 1
class RobotArmController:
    def __init__(self):
        super().__init__()
        ports = list.comports()
        for port in ports: print(port)
        
        self.servopins = [9,6,5,3,11];    # Define servo interface digital interface 9 for servo 0, etc
        self.servo_angles = [90,89,90,90,90]
        self.initialized= False

    def initialize(self):
        if not self.initialized:
            self.arm = serial.Serial(port='COM5',baudrate=115200)
            self.__set_pinmodes_and_attach_servos()
        self.move_to(1,89)
        time.sleep(0.03)  
        self.move_to(2,90)
        time.sleep(0.02)  
        self.move_to(3,0)
        self.initialized  =True
    
    def move_servos(self, direction_servo1, direction_servo2):
        
        self.move_to(1, self.__convert_direction_to_new_angle(self.servo_angles[1], direction_servo1))
        time.sleep(0.01)   
        self.move_to(2, self.__convert_direction_to_new_angle(self.servo_angles[2], direction_servo2))
        time.sleep(0.01)   
        return (self.servo_angles[1]/180, self.servo_angles[2]/180)

    def move_to(self, servoNumber, angle):
        self.__send_command("servo_write", servoNumber, angle)
        self.servo_angles[servoNumber] = angle
        time.sleep(0.02)   
    
    def dispose(self):
        self.initialized = False
        self.arm.close() 
    
    def __set_pinmodes_and_attach_servos(self):
        for i,pin in enumerate(self.servopins):
            self.__send_command("pinmode",pin, 1)
            time.sleep(0.2)
            self.__send_command('servo_attach', i, pin)
            time.sleep(0.2)
        

    def __convert_direction_to_new_angle_absolute(self, previous_angle, direction):
        direction = np.clip(direction, -1, 1)
        new_angle_absolute = 90 + 90 * direction
        if new_angle_absolute > previous_angle:
            new_angle = previous_angle + int(np.min([10, (new_angle_absolute - previous_angle) /10]))
        else:
            new_angle = previous_angle - int(np.min([10, (previous_angle - new_angle_absolute) /10]))
        return int(np.clip(new_angle, 0, 180))
    
    def __convert_direction_to_new_angle(self, previous_angle, direction):
        direction = np.clip(direction, -1, 1)
        new_angle = int(previous_angle + round(direction * 10))
        # Move slightly in opposite direction when over the boundaries
        if new_angle > 182:
            new_angle = int(previous_angle + round(direction * -5))
        if new_angle < -2:
            new_angle = int(previous_angle + round(direction * -5))
        return int(np.clip(new_angle, 0, 180))
    
    def __send_command(self,command, arg0=0, arg1=0):
        data = json.dumps({"start": [command, arg0, arg1, 0, 0 ]}) + '\n'
        self.arm.write(bytes(data, 'utf8'))
        self.arm.flush()   

    

if __name__ == "__main__":
    arm = RobotArmController()
    arm.initialize()
    # arm.move_servos(1,-0.7)

