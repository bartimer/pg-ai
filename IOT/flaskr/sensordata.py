from sqlalchemy import Column, Integer, String, Float, desc, func, text
from sqlalchemy.orm import Session
from sqlalchemy.types import DateTime
from .database import Base, engine

class SensorData(Base):
    __tablename__ = "sensordata"
    id = Column(Integer, primary_key=True)
    device = Column(String(50) )
    inserted = Column(DateTime(timezone=True), default=func.now())
    light = Column(Float)
    local_temp = Column(Float)
    local_weather = Column(String(100))
    local_winddirection = Column(Integer)
    local_windspeed = Column(Float)
    pressure = Column(Integer)
    temperature = Column(Float)
    def as_dict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}

def getLastSensorData():
    query = text('''WITH Ranked AS (
  SELECT id,device,inserted,light, local_temp,local_weather,local_winddirection,local_windspeed,pressure,temperature,
    ROW_NUMBER() OVER (
      PARTITION BY device
      ORDER BY inserted DESC
    ) AS rk
  FROM sensordata
)
  SELECT *
  FROM Ranked
  WHERE rk = 1;''')
    with engine.connect() as conn:
        rows = conn.execute(query)
        return list(map(lambda row: {c: row[c] for c in rows.keys()},rows.mappings().all()))
def getLastListOfSensorDataFor(device):
    query = text(f'''
  SELECT	FROM_UNIXTIME(ROUND(UNIX_TIMESTAMP(inserted)/(300))*(300)) as timestamp,  
   temperature, pressure, light, local_temp, local_windspeed,local_winddirection, local_weather 
  FROM sensordata 
  WHERE device = '{device}'
  order by timestamp DESC
  LIMIT 2000
'''
)
    with engine.connect() as conn:
        rows = conn.execute(query)
        return list(map(lambda row: {c: row[c] for c in rows.keys()},rows.mappings().all()))

def getLastSensorDataFor(device):
     with Session(engine) as session:
        result = session.query(SensorData).filter_by(device=device).order_by(desc(SensorData.inserted)).first() 
        return result.as_dict()