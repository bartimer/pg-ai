import gym
import numpy as np

from stable_baselines3 import SAC

env = gym.make("Pendulum-v1")

model = SAC("MlpPolicy", env, verbose=1, tensorboard_log="./a2c_cartpole_tensorboard/")
model.learn(total_timesteps=10000, log_interval=4)

