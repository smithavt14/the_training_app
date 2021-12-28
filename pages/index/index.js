const _auth = require('../../utils/auth.js')
const _attendee = require('../../utils/attendee.js')
const _workout = require('../../utils/workout.js')

Page({

  data: {

  },

  // ----- Navigation Functions ----- 

  navigateToShow: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/show/show?id=${id}` })
  },

  navigateToCreate: function (e) {
    wx.navigateTo({ url: '/pages/create/create' })
  },

  // ----- Workout Functions -----

  getAllWorkouts: async function (user) {
    let workouts = await _attendee.fetchAllForUser(user)
    let trainingDates = await _workout.setTrainingDates(workouts)
    this.setData({trainingDates})
  },

  // ----- Display Functions -----

  scrollToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300,
      success: res => console.log(res),
      fail: err => console.log(err)
    })
  },

  // ----- Lifecycle Functions -----
  
  onLoad: async function () {
    const user = await _auth.getCurrentUser()
    this.getAllWorkouts(user)
  }
})