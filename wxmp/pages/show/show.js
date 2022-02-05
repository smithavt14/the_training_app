const _auth = require('../../utils/auth.js')
const _workout = require('../../utils/workout.js')
const _weather = require('../../utils/weather.js')

Page({
    data: {
        toggleContainer: false,
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

    addAttendee: async function () {
        this.setData({ 'btn.disabled': true })
        
        let user = this.data.user
        let workout = this.data.workout

        if (!user.is_attending) {
            workout = await _workout.addAttendee(workout.id, user.id)
            const attendees = await _workout.getAttendeeInfo(workout)
    
            this.setData({'workout.attendees': workout.attendees, attendees, 'user.is_attending': true})
            this.setData({ 'btn.disabled': false })
        }
    },

    removeAttendee: async function () {
        this.setData({ 'btn.disabled': true })

        let user = this.data.user
        let workout = this.data.workout

        let is_attending = workout.attendees.includes(user.id)

        if (is_attending) {
            wx.showModal({
                title: 'Training Cancellation',
                content: 'Are you sure you want to cancel?',
                cancelText: 'Go Back',
                confirmText: 'Confirm',
                success: async (res) => {
                    if (res.confirm) {
                        workout = await _workout.removeAttendee(workout.id, user.id)
                        let attendees = await _workout.getAttendeeInfo(workout)
                        this.setData({'workout.attendees': workout.attendees, attendees, 'user.is_attending': false})
                    }
                }
            }) 
        }
        this.setData({ 'btn.disabled': false })
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
        let user = await _auth.getCurrentUser()
        let workout = await _workout.fetchWithID(options.id)
        let attendees = await _workout.getAttendeeInfo(workout)

        user['is_attending'] = workout.attendees.includes(user.id)
        
        let location = await _weather.fetchGeoLocation(workout)
        let aqi = _weather.fetchAQI(workout, location)
        let weather = _weather.fetchWeather(location, workout)
        
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