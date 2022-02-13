const _auth = require('../../utils/auth.js')
const _workout = require('../../utils/workout.js')
const _picker = require('../../utils/picker.js')
const _category = require('../../utils/category.js')

Page({
    data: {
        illustrations: { run: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjic5ZMcoe8pvcs.png' },
        categories: _category.categoryNames, 
        date: _picker.date(),
        time: _picker.time(), 
        validated: false
    }, 

    // ----- Input Functions -----

    changeImage: function () {
        wx.chooseImage({
            success: (res) => {
              let MyFile = new wx.BaaS.File()
              let fileParams = {filePath: res.tempFilePaths[0]}
              let metaData = {categoryName: 'SDK'}
          
              MyFile.upload(fileParams, metaData).then(res => {
                this.setData({'workout.image': res.data.file, progress: false})
                this.validate()
              }, err => {
                wx.showToast({
                    title: 'Error', 
                    icon: "error", 
                    duration: 1500, 
                })
              }).onProgressUpdate(event => {
                  this.setData({progress: event.progress})
              })
            }
        })
    },
    
    changeCategory: function (e) {
        const categories = _category.categories
        const active = e.detail.value;

        this.setData({'workout.category': categories[active]})
        this.validate();
    },

    changeName: function (e) {
        let cursor = e.detail.cursor
        if (cursor >= 25) wx.showToast({title: 'Keep it Short', icon: 'none'})

        this.setData({'workout.name': e.detail.value})
        this.validate();
    },

    changeDate: function (e) {
        let index = e.detail.value
        let date = this.data.date
        
        this.setData({'workout.date': date.column[index].fullDate})
        this.validate();
    },

    changeCustomTime: function (e) {
        let id = e.currentTarget.dataset.id
        let index = e.detail.value
        let columns = this.data.time.columns
        let time = `${columns[0][index[0]]}:${columns[1][index[1]]} ${columns[2][index[2]]}`
        
        this.setData({[`workout.time.${id}`]: time})
        this.validate()
    },

    changeLocation: function (e) {
        wx.chooseLocation({
            success: (location) => {
                this.setData({'workout.location': location})
                this.validate();
            }, 
            fail: res => console.log(res)
        })
    },

    changeDescription: function (e) {
        this.setData({'workout.description': e.detail.value})
        this.validate()
    },

    // ----- Validation Functions -----

    validate: function () {
        let workout = this.data.workout

        if (workout.category
            && workout.name 
            && workout.date
            && workout.time
            && workout.time.start
            && workout.description 
            && workout.location) {

            this.setData({validated: true})
        }
    },

    // ----- Workout Functions -----

    createWorkout: function (workout, user) {
        _workout.create(workout, user).then(res => {
            wx.hideLoading()
            wx.showToast({ title: 'Success!', icon: "success", duration: 1500, 
                complete: () => {
                    wx.reLaunch({ url: '/pages/index/index' })
                }
            })
        })
    },

    editWorkout: function (workout) {
        _workout.edit(workout).then(res => {
            wx.hideLoading()
            wx.showToast({ title: 'Success!', icon: "success", duration: 1500, 
                complete: () => {
                    wx.reLaunch({ url: `/pages/show/show?id=${workout.id}` })
                }
            })
        })
    },

    submit: function () {
        wx.showLoading({ title: 'Submitting' })
        let workout = this.data.workout
        let user = this.data.user

        workout.id ? this.editWorkout(workout) : this.createWorkout(workout, user)
    },

    getWorkout: async function (id) {
        let workout = await _workout.fetchWithID(id)
        this.setData({workout})
    },

    // ----- Attendee Functions -----

    setAttendee: function (workoutId, userId) {
        let Attendees = new wx.BaaS.TableObject('attendees');
        let attendee = Attendees.create();

        let details = {user: userId, workout: workoutId}

        attendee.set(details).save().then(res => console.log(res))
    },

    // ----- Authentication Functions -----

    updateUserInformation: async function () {
        let user = await _auth.updateUserInfo()
        this.setData({user})
    },

    // ----- Lifecycle Functions -----

    onLoad: async function (options) {
        let user = await _auth.getCurrentUser()
        if (options.id) {
            this.getWorkout(options.id)
            this.setData({title: 'EDIT'})
        } else {
            this.setData({title: 'CREATE'})
        }
        this.setData({user})
    }
})