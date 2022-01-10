const key = 'e8e419bb9f8a4ea49e2edeeabb7dd3db'
const icons = {
  'partly_rainy': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScgPcA0OAmjL.png',
  'cloudy': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScnc5uBLm1uc.png',
  'rainy': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScy77rXVqgem.png',
  'thunderstorm': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScYhSJ1rVBNj.png', 
  'partly_sunny': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScBT1Dzg9OrA.png',
  'sunny': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScAoKFFDnB58.png',
  'windy': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uScc8C04VNack.png',
  'snow': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1n6uSc5QSJzmxfeO.png'
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

const setIcon = () => {

}

const fetchWeather = async () => {
  let location = await _auth.getCurrentLocation
  
  return new Promise(resolve => {
    
    let url = `https://api.heweather.net/s6/weather/now?location=${location.lat},${location.lon}&key=${key}`

    wx.request({
      url,
      success: (res) => {
        let data = res.data.HeWeather6[0].now
        console.log(data)
        resolve(data)
      },
      fail(err) {
        resolve(err)
      }
    })
  })
}

module.exports = { fetchAQI, fetchWeather }