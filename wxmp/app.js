const _auth = require('/utils/auth.js')

App({

  getFontFamily: function () {
    wx.loadFontFace({
      source: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nEL26pjKKOdojNO.ttf', 
      global: true,
      family: 'Montserrat',
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