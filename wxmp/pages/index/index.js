const _auth = require('../../utils/auth.js')
const _attendee = require('../../utils/attendee.js')
const _workout = require('../../utils/workout.js')

Page({

  data: {
    tab: { active: 'upcoming' }
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

  getAllWorkouts: async function () {
    let user = this.data.user
    let active = this.data.tab.active
    
    wx.showLoading({title: 'Loading...'})

    let workouts = await _workout.fetchAllForUser(user, active)
    workouts = await _workout.setTrainingDates(workouts, active)
    
    this.setData({workouts})
    wx.hideLoading()
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

  

  changeTab: function (e) {
    let active = e.currentTarget.dataset.value
    this.setData({'tab.active': active})
    this.getAllWorkouts()
  },

  getTabBoundaries: function () {
    const query = wx.createSelectorQuery().in(this)
    query.selectAll('.tab').boundingClientRect()
    query.exec((res) => {
      this.setData({
        'tab.past': res[0][0], 
        'tab.upcoming': res[0][1]
      })
      this.setData({
        'tab.past.color': '#0F2027', 
        'tab.upcoming.color': '#2C5364'
      })
    })
  },

  // ----- Lifecycle Functions -----
  
  onLoad: async function () {
    const user = await _auth.getCurrentUser()
    this.setData({user})
    
    this.getAllWorkouts()
  }, 

  onShow: function () {
    this.getTabBoundaries()
  }
})