const _auth = require('../../utils/auth.js')
const _workout = require('../../utils/workout.js')
const _attendee = require('../../utils/attendee.js')

Page({
    data: {
        toggleContainer: false, 
        illustrations: {
            swim: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjidYzx5mqh3pVD.png', 
            metcon: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjidYEeHJPcDdfX.png',
            yoga: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjidYx63uokqkjo.png',
            run: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjic5ZMcoe8pvcs.png',
            track: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjic5UlV4LLKSC1.png'
        }
    },

    // ----- Navigation Functions -----

    navigateHome: function () {
        wx.redirectTo({ url: '/pages/index/index' })
    },
    
    // ----- Lifecycle Functions -----
    onLoad: async function (options) {
        const user = await _auth.getCurrentUser()
        const workout = await _workout.fetchWithID(options.id)
        const data = await _attendee.findAll(workout, user)
        this.setData(data)
    },

    // ----- Workout Functions -----
    
    // ----- Custom Functions -----

    getWorkout: async function (id) {
        let workout = _auth.fetchWithID(id)
        this.setData({workout})
    },

    updateUserInformation: function () {
        const _getLoginCode = new Promise(resolve => {
            wx.login({
                success: res => resolve(res.code)
            })
        })
      
        const _getUserProfile = new Promise(resolve => {
            wx.getUserProfile({
                desc: '获取用户信息',
                success: res => resolve(res)
            })
        })

        Promise.all([_getLoginCode, _getUserProfile]).then(result => {
            const [code, userProfile] = result
            wx.BaaS.auth.updateUserInfo(userProfile, {code}).then(user => {
              wx.setStorageSync('user');
              this.setData(user);
            }, err => {
                console.log(err);
            })
        })
    },
    
    loginWithWeChat: function () {
        return new Promise(resolve => {
            wx.BaaS.auth.loginWithWechat().then(res => {
                wx.setStorageSync('user', {id: res.id});
                resolve(user);
            })
        })
    },

    createAttendee: async function () {
        let user = this.data.user
        let workout = this.data.workout
        
        await _attendee.create(user, workout)
        
        const data = await _attendee.findAll(workout, user)
        this.setData(data)
    },

    removeAttendee: async function () {
        let attendee = this.attendee
    },

    toggleContainer: function (e) {
        let binary = parseInt(e.currentTarget.dataset.binary)
        let toggleContainer = !!binary
        this.setData({toggleContainer})
    }
})