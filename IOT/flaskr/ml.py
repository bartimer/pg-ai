from datetime import datetime
import math
import os
import pickle
import sys


APP_ROOT = os.path.dirname(os.path.abspath(__file__))     
# set file directory path
MODEL_FOLDER = os.path.join(APP_ROOT, "models")
for file in os.listdir(MODEL_FOLDER):
    if file.endswith(".sav"):
        print(os.path.join(MODEL_FOLDER, file))

def predict(name):
   path = os.path.join(MODEL_FOLDER, f"model_{name}.sav") 
   path_light = os.path.join(MODEL_FOLDER, f"model_light_{name}.sav")
   
   try:
    model = pickle.load(open(path, 'rb')) 
    hours = math.ceil((datetime.timestamp(datetime.now()) - model.data.dates[-1].value/ 10**9) / (60 * 60))
    result = model.predict(start=len(model.data.dates)- 24,end=len(model.data.dates)+ hours + 5) 
    model_light = pickle.load(open(path_light, 'rb')) 
    hours_light = math.ceil((datetime.timestamp(datetime.now()) - model_light.data.dates[-1].value/ 10**9) / (60 * 60))
    result_light = model_light.predict(start=len(model_light.data.dates)- 24,end=len(model_light.data.dates)+ hours_light + 5) 
    
    mapped = list(map(lambda x: { 'timestamp': x[0].isoformat(), 'temperature': x[1], 'light':x[2]}, list(zip(result.index,result.values, result_light.values))))
    return mapped
   except:
        print(f'Error while loading {path}: {sys.exc_info()[0]}')
   