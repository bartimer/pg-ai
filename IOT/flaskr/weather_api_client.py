import requests
import sys
from datetime import datetime
from flaskr.config import api_key

lat = "50.84227998732948"
lon = "4.322829819747444"
url = f"https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&appid={api_key}&units=metric"

cached_response = {'temp':12, 'wind_speed': 10, 'wind_deg':210, 'weather':[{'main':'Clouds'}]}
last_check = datetime.now()
def get_weather():
    global cached_response
    global last_check
    
    dd = datetime.now() - last_check
    if dd.seconds < 60*50:
        return cached_response
    
    try:
        last_check = datetime.now()
        response = requests.get(url)
        cached_response = response.json()['current']
        
    except:
        print(f"An exception occurred:{sys.exc_info()[0]}")
    
    return cached_response