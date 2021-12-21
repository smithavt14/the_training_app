const _auth = require('/utils/auth.js')

App({
  onLaunch: function() {
    wx.BaaS = requirePlugin('sdkPlugin')
    wx.BaaS.wxExtend(wx.login, wx.getUserInfo)
    wx.BaaS.init('a7b1c8f99027c47a7afb')
    _auth.getCurrentUser()
  },
})