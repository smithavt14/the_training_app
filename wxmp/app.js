const _auth = require('/utils/auth.js')

App({

  getFontFamily: function () {
    wx.loadFontFace({
      source: 'url("https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nFXrCjrgTOkv6Vs.ttf")', 
      global: true,
      family: 'Lato',
      success: (res) => console.log(res)
    })
    wx.loadFontFace({
      source: 'url("https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nFXrCleNI8ilZrv.ttf")', 
      global: true,
      family: 'Lato Black',
      success: (res) => console.log(res)
    })
    wx.loadFontFace({
      source: 'url("https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nFny8ARtWkreokl.ttf")', 
      global: true,
      family: 'Lato Bold',
      success: (res) => console.log(res)
    })
  },
  
  onLaunch: function() {
    wx.BaaS = requirePlugin('sdkPlugin')
    wx.BaaS.wxExtend(wx.login, wx.getUserInfo)
    wx.BaaS.init('a7b1c8f99027c47a7afb')
    _auth.getCurrentUser()
    this.getFontFamily()
  },
})