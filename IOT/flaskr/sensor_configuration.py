
from sqlalchemy import Column, Float, Integer, String

from sqlalchemy.orm import Session
from .database import Base, engine
from flaskr.sensordata import getLastSensorDataFor

class Sensor(Base):
    __tablename__ = "sensor"
    id = Column(Integer, primary_key=True)
    name = Column(String(50) )
    description = Column(String(200) )
    area = Column(String(45) )
    x = Column(Float)
    y = Column(Float)
    def as_dict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}

def getSensors():
    with Session(engine) as session:
        result = session.query(Sensor)
        return result

def getSensor(id):
    with Session(engine) as session:
        result = session.query(Sensor).filter_by(id=id).first() 
        r = result.as_dict()
        r['lastData'] = getLastSensorDataFor(result.name)
        return r

