const key = 'e8e419bb9f8a4ea49e2edeeabb7dd3db'

/* --- https://dev.heweather.com/docs/api/air --- */

const fetchGeoLocation = (workout) => {
    return new Promise((resolve) => {
        let lat = workout.location.latitude
        let long = workout.location.longitude
        wx.request({
          url: `https://geoapi.qweather.com/v2/city/lookup?location=${long},${lat}&lang=en&key=${key}`,
          success: (res) => {

              resolve(res.data.location[0])
          }
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

const darkenColor = (hex) => {
  let lum = -0.03
  
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  lum = lum || 0;

  let rgb = "#", c, i;

  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }

  return rgb;
}

const fetchWeather = async () => {
  let location = await _auth.getCurrentLocation
  
  return new Promise(resolve => {
    
    let url = `https://api.heweather.net/s6/weather/now?location=${location.lat},${location.lon}&key=${key}`

    wx.request({
      url,
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        let data = res.data.HeWeather6[0].now
        resolve(data)
      },
      fail(err) {
        resolve(err)
      }
    })
  })
}

module.exports = { fetchAQI, fetchWeather }