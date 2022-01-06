const _auth = require('../../utils/auth.js')
const _workout = require('../../utils/workout.js')
const _picker = require('../../utils/picker.js')

Page({
    data: {
        illustrations: {
            'Swim': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjidYzx5mqh3pVD.png', 
            'Metcon': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjidYEeHJPcDdfX.png',
            'Yoga': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjidYx63uokqkjo.png',
            'Run': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjic5ZMcoe8pvcs.png',
            'Track': 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1mjic5UlV4LLKSC1.png'
        },
        category: {
            active: false,
            items: ['Run', 'Metcon', 'Track', 'Yoga', 'Swim']
        }, 
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
                this.setData({'workout.image': res.data.file})
                this.validate()
              }, err => {
                wx.showToast({
                    title: 'Error', 
                    icon: "error", 
                    duration: 1500, 
                })
              })
            }
        })
    },
    
    changeCategory: function (e) {
        const categories = this.data.category.items
        const active = e.detail.value;
        this.setData({'category.active': categories[active], 'workout.category': categories[active]})
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

    changeTime: function (e) {
        let selected = e.detail.value
        this.setData({'time.active': true, 'time.selected': selected, 'workout.time': selected})
        this.validate()
    },

    changeCustomTime: function (e) {
        let index = e.detail.value
        let columns = this.data.time.columns
        let time = `${columns[0][index[0]]}:${columns[1][index[1]]} ${columns[2][index[2]]}`
        
        this.setData({'time.index': index, 'time.active': true, 'workout.time': time})
        this.validate()
    },

    changeLocation: function (e) {
        wx.chooseLocation({
            success: (location) => {
                console.log(location)
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
            && workout.description 
            && workout.location) {

            this.setData({validated: true})
        }
    },

    // ----- Workout Functions -----

    createWorkout: function (workout) {
        _workout.create(workout).then(res => {
            let workoutId = res.data.id
            let userId = res.data.created_by
            this.setAttendee(workoutId, userId)
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

        workout.id ? this.editWorkout(workout) : this.createWorkout(workout)
    },

    getWorkout: async function (id) {
        let workout = await _workout.fetchWithID(id)
        console.log(workout)
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