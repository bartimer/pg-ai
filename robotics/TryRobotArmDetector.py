from RobotArmDetector import RobotArmDetector


detector = RobotArmDetector(True)

#detector.show_video()

x,y = detector.get_current_arm_end_coordinates(True)
print(y)