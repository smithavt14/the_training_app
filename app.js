App({
  onLaunch: function() {
    wx.BaaS = requirePlugin('sdkPlugin')
    //让插件帮助完成登录、支付等功能
    wx.BaaS.wxExtend(wx.login,
     wx.getUserInfo,
     wx.requestPayment)

    wx.BaaS.init('a7b1c8f99027c47a7afb')
    wx.BaaS.auth.loginWithWechat().then(res => {
      let user = {};
      user['id'] = res.id;
      wx.setStorageSync('user', user);
    })
  },
})