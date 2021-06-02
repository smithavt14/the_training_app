Page({

  data: {

  },

  sortDates: function (workouts) {
    let sessions = []
    workouts.forEach((workout) => {
      let dateOptions = {weekday: "long", month: "long", day: "numeric"}
      let date = new Date(workout.date_time).toLocaleDateString('en-us', dateOptions)
      
      let session = sessions.find(workout => workout.date === date);
      
      if (session) session['workouts'].push(workout)
      else sessions.push({date: date, workouts: [workout]})
    })
    this.setData({workouts: sessions})
  },
  
  getMyWorkouts: function () {
    let user = wx.getStorageSync('user');
    let id = user.id
    let query = new wx.BaaS.Query();

    query.compare('user', '=', `${id}`)

    let Attendees = new wx.BaaS.TableObject('attendees')
    Attendees.setQuery(query).expand(['workout']).find().then(res => {
      let workouts = res.data.objects.map(attendee => attendee.workout);
      this.sortDates(workouts)
    })
  },
  
  onLoad: function () {
    this.getMyWorkouts();
  }
})