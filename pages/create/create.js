Page({
    data: {
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
        const active = e.detail.value;
        this.setData({'category.active': active})
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

    getCurrentUser: function () {
        wx.getStorage({
            key: 'user',
            success: (res) => {
                let user = res.data;
                this.setData({user});
            },
            fail: async () => {
                let user = await this.loginWithWeChat();
                this.setData({user})
            }
        })
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

    submitWorkout: function () {
        wx.showLoading({ title: 'Uploading' })

        let Workouts = new wx.BaaS.TableObject('workouts');
        let workout = Workouts.create();
        let date_time = new Date(this.data.date.selected + ' ' + this.data.time.selected).toISOString().toString();
        
        let details = {
            name: this.data.name, 
            category: this.data.category.items[this.data.category.active],
            date_time,
            location: this.data.location,
            description: this.data.description
        }

        console.log(details);

        workout.set(details).save().then(res => {
            console.log(res);
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

    onLoad: function () {
        this.getCurrentUser();
        this.setDate();
    }
})