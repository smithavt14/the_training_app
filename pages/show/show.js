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

    // ----- Workout Functions -----

    getWorkout: async function (id) {
        let workout = _auth.fetchWithID(id)
        this.setData({workout})
    },

    // ----- Attendee Functions -----

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

    // ----- Auth functions -----
    updateUserInformation: async function () {
        let user = await _auth.updateUserInfo()
        console.log(user)
    },
    
    // ----- Custom Functions -----

    toggleContainer: function (e) {
        let binary = parseInt(e.currentTarget.dataset.binary)
        let toggleContainer = !!binary
        this.setData({toggleContainer})
    }, 

    // ----- Lifecycle Functions -----
    onLoad: async function (options) {
        const user = await _auth.getCurrentUser()
        const workout = await _workout.fetchWithID(options.id)
        const data = await _attendee.findAll(workout, user)
        this.setData(data)
    },

    onShareAppMessage: function () {
        let title = this.data.workout.name
        let date = this.data.workout.date
        let id = this.data.workout.id
        let imageUrl = this.data.illustrations[this.data.workout.category]

        return { title: `${title} (${date})`, path: `/page/show?id=${id}`, imageUrl }
    }
})