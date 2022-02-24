import os
from flask_cors import cross_origin
from flaskr.json_encoder import DateTimeEncoder
from flaskr.ml import predict
from flaskr.sensordata import SensorData, getLastSensorData, getLastListOfSensorDataFor
from .database import engine
import flaskr.sensor_configuration as sensor
from sqlalchemy.orm import Session
from flask import Flask, jsonify
from .mqtt_subscriber import start_subscription
    
def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.json_encoder = DateTimeEncoder
    app.config.from_mapping(
        SECRET_KEY='dev',
        
    )
    print('Starting app')
    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/api/sensordata')
    @cross_origin()
    def getSensorData():
        with Session(engine) as session:
            result = session.query(SensorData)
            return jsonify(list(map(lambda x: x.as_dict(), result)))
    
    @app.route('/api/sensordata/last')
    @cross_origin()
    def getTheLastSensorData():
        return jsonify(getLastSensorData())
    
    @app.route('/api/sensors/<string:name>/data')
    @cross_origin()
    def getTheLastSensorDataFor(name):
        return jsonify(getLastListOfSensorDataFor(name))
    
    @app.route('/api/sensors/<string:name>/predict')
    @cross_origin()
    def predictIt(name):
        result = predict(name)
        return jsonify(result)

    @app.route('/api/sensors/<string:id>')
    @cross_origin()
    def getSensor(id):
        return sensor.getSensor(id)

    @app.route('/api/sensors')
    @cross_origin()
    def getSensors():
        return jsonify(list(map(lambda x: x.as_dict(), sensor.getSensors())))
   
    # if __name__ == '__main__':
    #      socketio.run(app)
    return app

create_app()
start_subscription()