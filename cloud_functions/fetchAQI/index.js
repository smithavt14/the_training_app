exports.main = async function fetchAQI(event, callback) {
  
  let location = event.data.location
  let workout = event.data.workout
  
  const key = 'e8e419bb9f8a4ea49e2edeeabb7dd3db'
  
  BaaS.request.get(`https://api.qweather.com/v7/air/5d?location=${location.id}&key=${key}&lang=en`)
  .then(res => {
    
    let forecast = res.data.daily
    let aqi = forecast.find(day => { new Date(day.fxDate).getDate() === new Date(workout.start_date_time).getDate() })
    
    callback(null, aqi)
  })
  .catch(error => {
    console.log('error message -->', error)
    fetchAQI(event, callback)
  })
}