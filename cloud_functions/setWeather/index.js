exports.main = async function addWeatherAndAqi (event, callback) {

  const workout = event.data

  let location = await BaaS.invoke('fetchLocation', { workout })
  location = location.data

  Promise.all([BaaS.invoke('fetchAQI', {location, workout}), BaaS.invoke('fetchWeather', {location, workout})]).then(values => {
    let aqi = values[0]
    let weather = values[1]

    callback(null, {weather, aqi})
  })
}
