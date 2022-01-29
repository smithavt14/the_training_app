exports.main = async function fetchLocation(event, callback) {
  
  let workout = event.data.workout
  
  const key = 'e8e419bb9f8a4ea49e2edeeabb7dd3db'
  
  let lat = workout.location.latitude
  let long = workout.location.longitude
  
  BaaS.request
  .get(`https://geoapi.qweather.com/v2/city/lookup?location=${long},${lat}&lang=en&key=${key}`)
  .then(res => { 
    let location = res.data.location[0]
    callback(null, location)
  })
  .catch(err => {
    console.log('error -->', err)
    fetchLocation(event, callback)
  })
}