from math import sqrt
import gym
import numpy as np
import stable_baselines3 as sb3

from RobotArmController import RobotArmController
from RobotArmDetector import RobotArmDetector

class RobotArmEnv(gym.Env):
    def __init__(self):
        super().__init__()
        self.observation_space = gym.spaces.Box(low=0.0, high=1.0, shape=(6,), dtype=np.float32)
        self.action_space = gym.spaces.Box(low=-1.0, high=1.0, shape=(2,), dtype=np.float32) 
        self.controller = RobotArmController()
        self.detector = RobotArmDetector(True)
        self.visited_x = []
        self.visited_y = []
    
    def reset(self):
        self.timestep = 0
        self.controller.initialize()
        x,y = self.detector.get_current_arm_end_coordinates()
        target_x, target_y = self.detector.get_target_location()
        self.state = (target_x, target_y, x, y, 0.5,0.5)
        self.timestep = 0
        return self.state
    
    def step(self, action):
        previous_distance  = sqrt((self.state[0] - self.state[2]) ** 2 + (self.state[1] - self.state[3]) ** 2)
        previous_servo_positions = (self.state[4],self.state[5])
        new_servo_positions = self.controller.move_servos(action[0], action[1])
        
        new_x, new_y = self.detector.get_current_arm_end_coordinates()
        target_x, target_y = self.detector.get_target_location()
        
        self.state = (target_x, target_y, new_x, new_y, new_servo_positions[0], new_servo_positions[1])
        self.timestep += 1
        
        self.visited_x.append(self.state[2])
        self.visited_y.append(self.state[3])

        reward = -0.5
        done = False
        distance  = sqrt((target_x - new_x) ** 2 + (target_y - new_y) ** 2)
        if distance < 0.03:
            reward = 50
            done = True
        elif distance - previous_distance > 0.005:
            reward = -5
        elif abs(previous_servo_positions[0]-new_servo_positions[0]) < 0.05 and abs(previous_servo_positions[1]-new_servo_positions[1]) < 0.05 and distance > 0.1:
            reward = -2
        elif abs(previous_servo_positions[0] + new_servo_positions[0]) > 1.9 or abs(previous_servo_positions[1] + new_servo_positions[1]) > 1.9:
            reward = -1
        elif self.timestep == 500:
            done = True
        
        self.detector.put_info(distance, reward)
        
        return self.state, reward, done, {}

env = RobotArmEnv()
agent = sb3.SAC(
    policy="MlpPolicy",
    env=env,
    verbose=2,
    tensorboard_log='./logs'
)
agent.learn(total_timesteps=10000)

