const _auth = require('../../utils/auth.js')
const _workout = require('../../utils/workout.js')
const _attendee = require('../../utils/attendee.js')
const _weather = require('../../utils/weather.js')

Page({
    data: {
        toggleContainer: false, 
        illustrations: {
            'Swim': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjidYzx5mqh3pVD.png', 
            'Metcon': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjidYEeHJPcDdfX.png',
            'Yoga': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjidYx63uokqkjo.png',
            'Run': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjic5ZMcoe8pvcs.png',
            'Track': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjic5UlV4LLKSC1.png'
        },
        animation: {
            toggleSize: {},
            attendees: []
        },
        activeAttendee: -1
    },

    // ----- Animation Functions -----

    setAttendeeAnimation: function () {
        let attendees = this.data.attendees
        let animation = this.data.animation

        attendees.forEach(() => { animation.attendees.push({}) })

        this.setData({animation})
    },

    toggleActiveAttendee: function (e) {
        let active = e.currentTarget.dataset.index
        let activeAttendee = this.data.activeAttendee

        activeAttendee = active === activeAttendee ? -1 : active
        this.setData({activeAttendee})
    },

    animateAttendee: function (e) {
        let activeIndex = e.currentTarget.dataset.index
        let activeAttendee = this.data.activeAttendee
        let animation = wx.createAnimation({duration: 500, timingFunction: 'ease'})
        let offset = e.currentTarget.offsetLeft
        
        this.data.attendees.forEach((attendee, index) => {
            index === activeAttendee ? animation.translateX(-offset).step() : animation.translateX(0).step()
        })        
        
        let property = `animation.attendees[${index}]`
        this.setData({[property]: animation.export()})
    },

    animateToggleSize: function () {
        let active = this.data.animation.toggleSize.active
        
        const toggleSize = wx.createAnimation({duration: 500, timingFunction: 'ease'})

        active ? toggleSize.height(180).step() : toggleSize.height(360).step()
        
        this.setData({'animation.toggleSize': toggleSize.export() })
        this.setData({'animation.toggleSize.active': !active })
    },

    // ----- Navigation Functions -----

    navigateHome: function (e) {
        wx.redirectTo({ url: '/pages/index/index' })
    },

    navigateToEdit: function () {
        let id = this.data.workout.id
        wx.navigateTo({ url: `/pages/create/create?id=${id}` })
    },

    // ----- Workout Functions -----

    // ----- Location Functions -----
    openLocation: function () {
        let location = this.data.workout.location
        
        wx.openLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name,
            address: location.address,
            scale: 14
        })
    },

    // ----- Attendee Functions -----

    createAttendee: async function () {
        this.setData({ 'btn.disabled': true })
        
        let user = this.data.user
        let workout = this.data.workout
        
        await _attendee.create(user, workout)
        
        const data = await _attendee.findAllForWorkout(workout, user)
        this.setData(data)
        this.setData({ 'btn.disabled': false })
    },

    removeAttendee: async function () {
        let user = this.data.user
        let workout = this.data.workout

        if (user.is_attending) {
            wx.showModal({
                title: 'Training Cancellation',
                content: 'Are you sure you want to cancel?',
                cancelText: 'Go Back',
                confirmText: 'Confirm',
                success: async (res) => {
                    if (res.confirm) {
                        await _attendee.remove(user.attendee)
                        const data = await _attendee.findAllForWorkout(workout, user)
                        this.setData(data)
                    }
                }
            })
            
        }
    },

    // ----- Auth functions -----
    updateUserInformation: async function () {
        let user = await _auth.updateUserInfo()
        this.setData({user})
    },
    
    // ----- Custom Functions ----
    toggleContainer: function (e) {
        let binary = parseInt(e.currentTarget.dataset.binary)
        let toggleContainer = !!binary
        this.setData({toggleContainer})
    },

    // ----- Map Functionality -----

    buildMap: function () {
        this.mapCtx = wx.createMapContext('myMap')
    },

    

    // ----- Lifecycle Functions -----
    onLoad: async function (options) {
        wx.showLoading({title: 'Loading...'})
        let unset_user = await _auth.getCurrentUser()
        let workout = await _workout.fetchWithID(options.id)
        
        let [attendees, user] = await _attendee.findAllForWorkout(workout, unset_user)
        
        let location = await _weather.fetchGeoLocation(workout)
        let aqi = _weather.fetchAQI(workout, location)
        let weather = _weather.fetchWeather(location)
        
        Promise.all([aqi, weather]).then(values => {
          this.setData({ user, workout, attendees, aqi: values[0], weather: values[1] })
          wx.hideLoading()
        })
    },

    onShareAppMessage: function () {
        let title = this.data.workout.name
        let date = this.data.workout.date
        let id = this.data.workout.id
        let imageUrl = this.data.workout.image ? this.data.workout.image.path : this.data.illustrations[this.data.workout.category]

        return { title: `${title} (${date})`, path: `/pages/show/show?id=${id}`, imageUrl }
    }
})