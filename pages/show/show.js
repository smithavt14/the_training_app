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
        this.getUser();
        this.getWorkout(options.id);
    },

    // ----- Custom Functions -----

    getWorkout: function (id) {
        const Workout = new wx.BaaS.TableObject('workouts')

        Workout.get(id).then(res => {
            let workout = res.data;
            let options = {weekday: "long", month: "long", day: "numeric"};

            workout.date_time = new Date(workout.date_time).toLocaleDateString('en-us', options);
            
            this.setData({workout: res.data});
            this.getAttendees(res.data.id);
            // this.getReviews(res.data.id);
        })
    },

    completeWorkout: function (e) {
        const attendees = this.data.attendees; 
        const myAttendee = attendees.find(attendee => attendee.is_user);

        myAttendee['is_complete'] = true;

        this.setData({attendees})
    },

    getUser: function () {
        const user = wx.getStorageSync('user');
        this.setData({user});
    },

    getAttendees: function (id) {
        let Attendees = new wx.BaaS.TableObject('attendees');
        let query = new wx.BaaS.Query();

        query.compare('workout', '=', id);

        Attendees.setQuery(query).expand(['user']).find().then(res => {
            const attendees = res.data.objects;
            
            // Identify whether user is an attendee
            const user = wx.getStorageSync('user');
            const myAttendee = attendees.find(attendee => attendee.user.id === user.id);
            if (myAttendee) myAttendee['is_user'] = true;
            if (myAttendee) myAttendee['is_user'] = true;

            // Create local data variable to easily access info
            const is_user = !!myAttendee;

            // Set whether or not the workout it complete
            const is_complete =  myAttendee['is_complete']

            this.setData({attendees, is_complete, is_user})

            wx.pageScrollTo({
                scrollTop: 100,
                duration: 300
            })
        })
    },

    toggleContainer: function (e) {
        let binary = parseInt(e.currentTarget.dataset.binary)
        let toggleContainer = !!binary
        this.setData({toggleContainer})
    }
})