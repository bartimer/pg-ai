import socket
import json

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('localhost', 9395))

servo_index = 0
angle_degrees = 45
command = {'start': ['servo_write', servo_index, angle_degrees, 0, 0]}
command_str = json.dumps(command) + '\n'
print(command_str)
command_bytes = bytes(command_str, 'utf8')
print(command_bytes)

s.sendall(command_bytes)
s.close()

print('all done')