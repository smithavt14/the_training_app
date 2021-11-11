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
    
    // ----- Lifecycle Functions -----
    onLoad: function (options) {
        this.getCurrentUser();
        this.getWorkout(options.id);
    },

    // ----- Custom Functions -----

    getWorkout: function (id) {
        const Workout = new wx.BaaS.TableObject('workouts')

        Workout.get(id).then(res => {
            let workout = res.data;
            let dateOptions = {weekday: "long", month: "long", day: "numeric"}
            let timeOptions = {hour: 'numeric', minute: '2-digit'}

            workout.date = new Date(workout.date_time).toLocaleDateString('en-us', dateOptions);
            workout.time = new Date(workout.date_time).toLocaleTimeString('en-us', timeOptions);

            workout.name = workout.name.toUpperCase();
            
            this.setData({workout});
            this.getAttendees(workout.id);
        })
    },

    getCurrentUser: function () {
        wx.getStorage({
            key: 'user',
            success: (res) => {
                let user = res.data
                this.setData({user});
            },
            fail: async () => {
                let user = await this.loginWithWeChat();
                this.setData({user});
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
    
    loginWithWeChat: function () {
        return new Promise(resolve => {
            wx.BaaS.auth.loginWithWechat().then(res => {
                wx.setStorageSync('user', {id: res.id});
                resolve(user);
            })
        })
    },

    getAttendees: function (id) {
        let Attendees = new wx.BaaS.TableObject('attendees');
        let query = new wx.BaaS.Query();

        query.compare('workout', '=', id);

        Attendees.setQuery(query).expand(['user']).find().then(res => {
            let createdBy = this.data.workout.created_by
            let attendees = res.data.objects;
            
            // Identify whether user is an attendee;
            const user = this.data.user;
            user['is_attending'] = attendees.some(attendee => attendee.user.id === user.id);
            
            // Find the creator, separate him from the attendee list; 
            const index = attendees.findIndex(attendee => attendee.user.id === createdBy);
            const creator = attendees[index];
            attendees.splice(0, 1);

            // Check if user is creator; 
            if (creator) {
                user['is_creator'] = creator.user.id === user.id; 
            } else  {
                user['is_creator'] = false
            }

            this.setData({attendees, user, creator})
        })
    },

    createAttendee: function () {
        let workout = this.data.workout;
        let user = this.data.user;
        
        let Attendees = new wx.BaaS.TableObject('attendees');
        let attendee = Attendees.create();

        let details = {user: user.id, workout: workout.id}

        attendee.set(details).save().then(res => {
            wx.showModal({title: 'Success!', icon: 'success'})
            console.log(res);
            this.getAttendees(workout.id);
        });
    },

    toggleContainer: function (e) {
        let binary = parseInt(e.currentTarget.dataset.binary)
        let toggleContainer = !!binary
        this.setData({toggleContainer})
    }
})