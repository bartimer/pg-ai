from math import sqrt
import gym
import numpy as np
import stable_baselines3 as sb3
from stable_baselines3.common.callbacks import EvalCallback
from stable_baselines3.common.monitor import Monitor
from RobotArmController import RobotArmController
from RobotArmDetector import RobotArmDetector

class RobotArmEnv(gym.Env):
    def __init__(self):
        super().__init__()
        self.observation_space = gym.spaces.Box(low=0.0, high=1.0, shape=(6,), dtype=np.float32)
        self.action_space = gym.spaces.Box(low=-1.0, high=1.0, shape=(2,), dtype=np.float32) 
        self.controller = RobotArmController()
        self.detector = RobotArmDetector(False)
        self.visited_x = []
        self.visited_y = []
        self.timsteps_max = 200
    
    def reset(self):
        self.timestep = 0
        self.controller.initialize()
        x,y = self.detector.get_current_arm_end_coordinates()
        target_x, target_y = self.detector.get_target_location()
        self.state = (target_x, target_y, x, y, 0.5,0.5)
        self.timestep = 0
        self.stand_still_count = 0
        return self.state
    
    def step(self, action):
        previous_distance  = sqrt((self.state[0] - self.state[2]) ** 2 + (self.state[1] - self.state[3]) ** 2)
        previous_servo_positions = (self.state[4],self.state[5])
        new_servo_positions = self.controller.move_servos(action[0], action[1])
        
        new_x, new_y = self.detector.get_current_arm_end_coordinates()
        target_x, target_y = self.detector.get_target_location()
        
        any_movement = abs(new_servo_positions[0] - previous_servo_positions[0]) > 0.005 or abs(new_servo_positions[1] - previous_servo_positions[1]) > 0.005
        if any_movement:
            self.stand_still_count = 0  # np.max([0, self.stand_still_count - 5])
        else:
            self.stand_still_count += 1 

        self.state = (target_x, target_y, new_x, new_y, new_servo_positions[0], new_servo_positions[1])
        self.timestep += 1
        
        self.visited_x.append(self.state[2])
        self.visited_y.append(self.state[3])

        done = False
        distance_max = sqrt((np.max([target_x, 1-target_x])) ** 2 + ((np.max([target_y, 1-target_y])) ** 2))
        distance  = sqrt((target_x - new_x) ** 2 + (target_y - new_y) ** 2)
        
        if distance < 0.04:
            reward = 100
            done = True
            print('Target reached!')
        elif any_movement:
            reward = (0.9 - (distance/distance_max)**0.35)
        else:
            reward = -1 + (-10) * self.stand_still_count/self.timsteps_max
        
        # elif distance > 0.2:
        #     reward = np.clip(distance * 10 ,1,5) * -1
        # elif abs(previous_servo_positions[0]-new_servo_positions[0]) < 0.05 and abs(previous_servo_positions[1]-new_servo_positions[1]) < 0.05 and distance > 0.2:
        #     reward = -2
        # elif abs(previous_servo_positions[0] + new_servo_positions[0]) > 1.9 or abs(previous_servo_positions[1] + new_servo_positions[1]) > 1.9:
        #     reward = -1
        
        if self.timestep == self.timsteps_max:
            reward = -10
            done = True
            print('End of episode. Target not reached.')
        
        self.detector.put_info(distance, reward, self.timestep, action, new_servo_positions)
        
        return self.state, reward, done, {}

if __name__ == "__main__":
    env = RobotArmEnv()

    env = Monitor(env,'./logs/')
    eval_callback = EvalCallback(env, best_model_save_path='./logs/',
                                log_path='./logs/', eval_freq=200,
                                deterministic=True, render=False)

    agent = sb3.SAC(
        policy="MlpPolicy",
        env=env,
        verbose=1,
        tensorboard_log="./logs/"
    )

    agent.learn(total_timesteps = 5000,log_interval=2, callback=eval_callback)

# class TensorboardCallback(BaseCallback):
#     """
#     Custom callback for plotting additional values in tensorboard.
#     """

#     def __init__(self, verbose=0):
#         super(TensorboardCallback, self).__init__(verbose)

#     def _on_step(self) -> bool:
#         # Log scalar value (here a random variable)
#         value = np.random.random()
#         self.logger.record('random_value', value)
#         if (self.num_timesteps % 50 == 0):
#             self.logger.dump(self.num_timesteps)
#         return True



