const _auth = require('../../utils/auth.js')

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
        date: {
            active: false,
        },
        time: {
            active: false,
        }, 
        validated: false
    }, 
    
    changeCategory: function (e) {
        const categories = this.data.category.items
        const active = e.detail.value;
        this.setData({'category.active': categories[active]})
        this.validate();
    },

    setDate: function () {
        const now = new Date(Date.now())
        let end = new Date(Date.now())
        end = new Date(end.setDate(end.getDate() + 14))
        
        const year = now.getFullYear()
        const month = now.getMonth() < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1
        const day = now.getDate()
        const start = `${year}-${month}-${day}`

        const yearEnd = end.getFullYear()
        const monthEnd = end.getMonth() < 10 ? `0${end.getMonth() + 1}` : end.getMonth() + 1
        const dayEnd = end.getDate()
        end = `${yearEnd}-${monthEnd}-${dayEnd}`

        this.setData({'date.start': start, 'date.end': end})
    },

    changeName: function (e) {
        this.setData({name: e.detail.value})
        this.validate();
    },

    changeDate: function (e) {
        const options = {year: 'numeric', month: 'long', weekday: 'long', day: 'numeric'}
        const selected = new Date(e.detail.value).toLocaleDateString('en-us', options)
        
        this.setData({'date.active': true, 'date.selected': selected})
        this.validate();
    },

    changeTime: function (e) {
        this.setData({'time.active': true, 'time.selected': e.detail.value})
        this.validate();
    },

    changeLocation: function (e) {
        wx.chooseLocation({
            success: (location) => {
                this.setData({location})
                this.validate();
            }, 
            fail: res => console.log(res)
        })
    },

    changeDescription: function (e) {
        this.setData({description: e.detail.value})
        this.validate();
    },

    validate: function () {
        let data = this.data

        if (data.category.active 
            && data.name 
            && data.category
            && data.date.active 
            && data.time.active 
            && data.description 
            && data.location) {

            this.setData({validated: true})
        }
    },

    submitWorkout: function () {
        console.log('submitWorkout')
        wx.showLoading({ title: 'Uploading' })

        let Workouts = new wx.BaaS.TableObject('workouts');
        let workout = Workouts.create();
        let date_time = new Date(this.data.date.selected + ' ' + this.data.time.selected).toISOString().toString();
        
        let details = {
            name: this.data.name, 
            category: this.data.category.active.toLowerCase(),
            date_time,
            location: this.data.location,
            description: this.data.description
        }

        workout.set(details).save().then(res => {
            let workoutId = res.data.id;
            let userId = res.data.created_by;
            this.setAttendee(workoutId, userId);
            wx.hideLoading();
            wx.showToast({
                title: 'Success!', 
                icon: "success", 
                duration: 1500, 
                complete: () => {
                    wx.reLaunch({ url: '/pages/index/index' })
                }
            })
        }, err => {
            wx.hideLoading();
            console.log(err);
            wx.showToast({
                title: 'Error', 
                icon: "error", 
                duration: 1500, 
            })
        })
    },

    setAttendee: function (workoutId, userId) {
        let Attendees = new wx.BaaS.TableObject('attendees');
        let attendee = Attendees.create();

        let details = {user: userId, workout: workoutId}

        attendee.set(details).save().then(res => console.log(res))
    },

    onLoad: async function () {
        let user = await _auth.getCurrentUser()
        this.setData({user});
        this.setDate();
    }
})