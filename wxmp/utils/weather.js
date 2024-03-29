const key = 'e8e419bb9f8a4ea49e2edeeabb7dd3db'
const icons = {
  'partly_rainy': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScgPcA0OAmjL.png',
  'overcast': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScnc5uBLm1uc.png',
  'rainy': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScy77rXVqgem.png',
  'thunderstorm': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScYhSJ1rVBNj.png', 
  'partly_cloudy': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uu6BFKcMphTJo.png',
  'partly_cloudy_night': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uu6jsr632MbYK.png',
  'clear': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uu6NcqW37F1wx.png',
  'windy': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScc8C04VNack.png',
  'snow': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uSc5QSJzmxfeO.png',
  'partly_rainy_night': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uu6XM4iNZa5gP.png',
  'clear_night': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uu6osrq8ZkTjp.png',
  'undefined': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6vQV9QlS8iLXIo.png'
}

const backgrounds = {
  'day': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uKip3Scm2yBbL.jpg',
  'night': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uKi96ZDgwE1yF.jpg'
}

const setIcon = (weather, workout) => {
  return new Promise(resolve => {
    let workoutTime = new Date(workout.start_date_time).toLocaleTimeString('it-IT')
    let timeOfDay = workoutTime >= weather.sunrise && workoutTime ? 'Day' : 'Night'

    weather['background'] = backgrounds[timeOfDay.toLowerCase()]
    weather['temp'] = timeOfDay === 'Day' ? weather.tempMax : weather.tempMin
    weather['text'] = timeOfDay === 'Day' ? weather.textDay : weather.textNight

    let icon = timeOfDay === 'Day' ? weather.iconDay : weather.iconNight
    
    
    if (['100', '150'].includes(icon)) {
      weather['new_icon'] = timeOfDay === 'Day' ? icons['clear'] : icons['clear_night']
      resolve(weather)
    
    } else if (['300', '301', '350', '351'].includes(icon)) {
      weather['new_icon'] = timeOfDay === 'Day' ? icons['partly_rainy'] : icons['partly_rainy_night']
      resolve(weather)
      
    } else if (['104', '154', '501'].includes(icon)) {
      weather['new_icon'] = icons['overcast']
      resolve(weather)

    } else if (['305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '399'].includes(icon)) {
      weather['new_icon'] = icons['rainy']
      resolve(weather)

    } else if (['302', '303', '304'].includes(icon)) {
      weather['new_icon'] = icons['thunderstorm']
      resolve(weather)

    } else if (['101', '102', '103', '151', '152', '153'].includes(icon)) {
      weather['new_icon'] = timeOfDay === 'Day' ? icons['partly_cloudy'] : icons['partly_cloudy_night']
      resolve(weather)

    } else if (['2001'].includes(icon)) {
      weather['new_icon'] = icons['windy']
      resolve(weather)

    } else if (['400', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '456', '457', '499', '1004', '1033', '1040'].includes(icon)) {
      weather['new_icon'] = icons['snow']
      resolve(weather)

    } else {
      weather['new_icon'] = icons['undefined']
      resolve(weather)
    }
  }) 
}

/* --- https://dev.heweather.com/docs/api/air --- */

const fetchGeoLocation = (workout) => {
    return new Promise((resolve) => {
        let lat = workout.location.latitude
        let long = workout.location.longitude
        wx.request({
          url: `https://geoapi.qweather.com/v2/city/lookup?location=${long},${lat}&lang=en&key=${key}`,
          success: (res) => { resolve(res.data.location[0]) }
        })
    })
}

const fetchAQI = async (workout) => {
    let location = await fetchGeoLocation(workout)
    return new Promise (resolve => { 
        wx.request({
            url: `https://api.qweather.com/v7/air/now?location=${location.id}&key=${key}`,
            success: async (res) => {
                let hex = setColor(res.data.now.category)
                let number = res.data.now.aqi
                let category = res.data.now.category
                resolve({ hex, number, category, location })
            },
            fail: (err) => {
                console.log(err)
                resolve()
            }
        })
    })
}

const setColor = (qlty) => {
  if (qlty === '优') return '#6ACF4B'
  if (qlty === '良') return '#FFDA3B'
  if (qlty === '轻度污染') return '#FF722E'
  if (qlty === '中度污染') return '#EF0024'
  if (qlty === '重度污染') return '#AD3A83'
  if (qlty === '严重污染') return '#933D40'
}

const setWeatherForecast = (forecasts, workout) => {
  return new Promise(resolve => {
    let weather = forecasts.find((weather) => {
      let forecastDate = new Date(weather.fxDate).getDate()
      let workoutDate = new Date(workout.date).getDate()
      return forecastDate === workoutDate
    })
    resolve(weather)
  })
}

const fetchWeather = async (location, workout) => {
  return new Promise(resolve => {
    wx.request({
      url: `https://api.qweather.com/v7/weather/10d?location=${location.id}&key=${key}&lang=en`,
      success: async (res) => { 
        let weather = await setWeatherForecast(res.data.daily, workout)
        weather = await setIcon(weather, workout)
        resolve(weather) 
      }
    })
  })
}

module.exports = { fetchAQI, fetchWeather, fetchGeoLocation }