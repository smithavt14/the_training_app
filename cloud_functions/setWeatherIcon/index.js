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

exports.main = async function setWeatherIcon(weather, workout) {
  
  let workoutTime = new Date(workout.start_date_time).toLocaleTimeString('it-IT')
  let timeOfDay = workoutTime >= weather.sunrise && workoutTime ? 'Day' : 'Night'
  
  weather.background = backgrounds[timeOfDay.toLowerCase()]
  weather.temp = timeOfDay === 'Day' ? weather.tempMax : weather.tempMin
  weather.text = timeOfDay === 'Day' ? weather.textDay : weather.textNight
  
  let icon = timeOfDay === 'Day' ? weather.iconDay : weather.iconNight
      
      
  if (['100', '150'].includes(icon)) {
    weather.new_icon = timeOfDay === 'Day' ? icons.clear : icons.clear_night
    callback(null, weather)
      
  } else if (['300', '301', '350', '351'].includes(icon)) {
    weather.new_icon = timeOfDay === 'Day' ? icons.partly_rainy : icons.partly_rainy_night
    callback(null, weather)
        
  } else if (['104', '154', '501'].includes(icon)) {
    weather.new_icon = icons.overcast
    callback(null, weather)
  
  } else if (['305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '399'].includes(icon)) {
    weather.new_icon = icons.rainy
    callback(null, weather)
  
  } else if (['302', '303', '304'].includes(icon)) {
    weather.new_icon = icons.thunderstorm
    callback(null, weather)
  
  } else if (['101', '102', '103', '151', '152', '153'].includes(icon)) {
    weather.new_icon = timeOfDay === 'Day' ? icons.partly_cloudy : icons.partly_cloudy_night
    callback(null, weather)
  
  } else if (['2001'].includes(icon)) {
    weather.new_icon = icons.windy
    callback(null, weather)
  
  } else if (['400', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '456', '457', '499', '1004', '1033', '1040'].includes(icon)) {
    weather.new_icon = icons.snow
    callback(null, weather)
  
  } else {
    weather.new_icon = icons.undefined
    callback(null, weather)
  }
}