exports.main = async function fetchWeather(event, callback) {
  
  let location = event.data.location
  let workout = event.data.workout
  
  const key = 'e8e419bb9f8a4ea49e2edeeabb7dd3db'

  BaaS.request.get(`https://api.qweather.com/v7/weather/10d?location=${location.id}&key=${key}&lang=en`)
  .then(res => {
    console.log('Weather res.data(?) -->', res.data)
    let forecast = res.data.daily
    let weather = forecast.find(day => { new Date(day.fxDate).getDate() === new Date(workout.start_date_time).getDate() })
   
    callback(null, weather)
  })
  .catch(error => {
    console.log('Weather error message(?) -->', error.stack)
    fetchWeather(event, callback)
  })
}