from math import sqrt
import gym
import numpy as np
import stable_baselines3 as sb3
from stable_baselines3.common.callbacks import EvalCallback
from stable_baselines3.common.monitor import Monitor
from RobotArmController import RobotArmController
from RobotArmDetector import RobotArmDetector
import collections


class DiscreteRobotArmEnv(gym.Env):
    def __init__(self):
        super().__init__()
        self.observation_space = gym.spaces.Box(low=0.0, high=1.0, shape=(8,), dtype=np.float32)
        self.action_space = gym.spaces.Discrete(16)
        self.controller = RobotArmController()
        self.detector = RobotArmDetector(False)
        self.visited_x = []
        self.visited_y = []
        self.timsteps_max = 200
        self.episodes_without_success = 0
        self.episodes_with_success = 0
        self.episodes = 0
        self.target_index = 1

    def reset(self):
        self.timestep = 0
        positions = self.controller.initialize()
        a = np.zeros((10, 2), dtype=float)
        a[:, 0].fill(positions[0])
        a[:, 1].fill(positions[1])
        self.previous_servo_positions = collections.deque(a, 10)
        p = self.detector.get_current_arm_end_coordinates()
        x,y = p[0]
        green_x, green_y  =p[1]
        if self.episodes_without_success == 12 or self.episodes_with_success == 10:
            target_x, target_y = self.detector.set_random_target_location(self.target_index)
            self.target_index += 1
            self.episodes_without_success = 0
            self.episodes_with_success = 0
            if self.target_index == 10: self.target_index = 1
        else:
            target_x, target_y = self.detector.get_target_location()
        self.state = (target_x, target_y, x, y, positions[0],positions[1], green_x, green_y)
        self.timestep = 0
        self.stand_still_count = 0
        return self.state

    def step(self, action):
        new_servo_positions = self.controller.move_servos_discrete(action)
        self.previous_servo_positions.append(new_servo_positions)
        
        p = self.detector.get_current_arm_end_coordinates()
        new_x, new_y = p[0]
        green_x, green_y  =p[1]
        target_x, target_y = self.detector.get_target_location()
        
        mean_previous_servo_pos = np.mean(self.previous_servo_positions, axis=0)
        
        any_movement = abs(new_servo_positions[0] - mean_previous_servo_pos[0]) > 0.01 or abs(
            new_servo_positions[1] - mean_previous_servo_pos[1]) > 0.01
        if any_movement:
            self.stand_still_count = 0
        else:
            self.stand_still_count += 1

        
        self.timestep += 1
        
        done = False
        
        distance_max = sqrt((np.max([target_x, 1-target_x])) ** 2 + ((np.max([target_y, 1-target_y])) ** 2))
        previous_distance = sqrt((target_x - self.state[2]) ** 2 + (target_y - self.state[3]) ** 2)
        distance = sqrt((target_x - new_x) ** 2 + (target_y - new_y) ** 2)
        
        self.state = (target_x, target_y, new_x, new_y, new_servo_positions[0], new_servo_positions[1],green_x, green_y)
        
        if distance < 0.04:
            reward = 50
            done = True
            self.episodes_with_success +=1
            print('Target reached!')
        elif any_movement:
            reward = (1 - (distance/distance_max)**0.4)
        else:
            reward = -0.1 + (-1) * float(np.max([0.2, distance])) * self.stand_still_count/self.timsteps_max


        if self.timestep == self.timsteps_max:
            done = True
            self.episodes_without_success += 1
            print('End of episode. Target not reached.')

        self.detector.put_info(
            distance, reward, self.timestep, action, new_servo_positions)

        if done:
            self.episodes += 1
        return self.state, reward, done, {}


if __name__ == "__main__":
    env = DiscreteRobotArmEnv()

    env = Monitor(env, './logs/')
    eval_callback = EvalCallback(env, best_model_save_path='./logs/',
                                 log_path='./logs/', eval_freq=200,
                                 deterministic=True, render=False)

    agent = sb3.PPO(
        policy="MlpPolicy",
        env=env,
        verbose=1,
        tensorboard_log="./logs/"
    )

    agent.learn(total_timesteps=10000, log_interval=2, callback=eval_callback)

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
