
from datetime import datetime
import json
import paho.mqtt.client as mqtt

from sqlalchemy.orm import Session
from .database import engine
from flaskr.sensordata import SensorData
from flaskr.weather_api_client import get_weather




# The callback for when the client receives ca CONNACK response from the MQTT Broker.
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("sensordata")

# The callback when a message is received from the MQTT Broker.
def on_message(client, userdata, msg):
    current = get_weather()
    print(f"{datetime.now()}: Info from weather API: temp={current['temp']},wind_speed={current['wind_speed']},wind_deg={current['wind_deg']},weather={current['weather'][0]['main']} \n")
    payload = json.loads(msg.payload.decode())
    print(msg.topic,": ", str(msg.payload),"\n")
    
    sample = SensorData(device=payload['name'],
    temperature=payload['temperature'],
    pressure=payload['pressure'],
    light=payload['light'],
    local_temp=current['temp'],
    local_windspeed=current['wind_speed'],
    local_winddirection=current['wind_deg'],
    local_weather=current['weather'][0]['main'])
    
    with Session(engine) as session:
            session.add(sample)
            session.commit()

client = mqtt.Client(clean_session=True, transport="tcp")
def start_subscription():
    client.on_connect = on_connect
    client.on_message = on_message
    print('Connecting to broker')
    #client.connect("broker.emqx.io", 1883, 60)
    client.connect("10.3.25.130", 1883, 60)
    client.loop_start()