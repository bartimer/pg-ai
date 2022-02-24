const apiBaseUrl = 'http://localhost:5000/api'

export function getSensors(){
  return fetch(`${apiBaseUrl}/sensors`).then(res =>
    res.json()
  )
}
export function getSensor(id){
  return fetch(`${apiBaseUrl}/sensors/${id}`).then(res =>
    res.json()
  )
}
export function getLastSensorData(){
  return fetch(`${apiBaseUrl}/sensordata/last`).then(res =>
    res.json()
  )
}
export function getLastSensorDataFor(device){
  return fetch(`${apiBaseUrl}/sensors/${device}/data`).then(res =>
    res.json()
  )
}
export function getPredictionsFor(device){
  return fetch(`${apiBaseUrl}/sensors/${device}/predict`).then(res =>
    res.json()
  )
}


