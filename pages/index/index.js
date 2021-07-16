Page({

  data: {

  },

  navigateToShow: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/show/show?id=${id}`
    })
  },

  sortDates: function (workouts) {
    let trainingDates = []
    let options = {weekday: "long", month: "long", day: "numeric"}
    let today = new Date().toLocaleDateString('en-us', options)
    
    workouts.forEach((workout) => {
      let date = new Date(workout.date_time).toLocaleDateString('en-us', options)
      // -- Check to see if this workout's day already exists in the trainingDates array
      let existing_date = trainingDates.find(workout => workout.date === date);
      let dateDiff = Math.floor((new Date(workout.date_time) - new Date()) / 1000 / 60 / 60 / 24)
      
      if (existing_date) {
        existing_date['workouts'].push(workout)
      } else {
        trainingDates.push({date, workouts: [workout], dateDiff})
      }
    })

    let positiveDates = trainingDates.filter(trainingDate => trainingDate.dateDiff >= 0 )
    positiveDates = positiveDates.sort((a, b) => a.dateDiff - b.dateDiff)

    console.log(positiveDates)

    trainingDates = trainingDates.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    this.setData({trainingDates})
    this.scrollToToday()
  },

  scrollToToday: function () {
    wx.pageScrollTo({
      selector: '.top',
      duration: 300,
      success: res => console.log(res),
      fail: err => console.log(err)
    })
  },

  getMyWorkouts: function () {
    // Set Variables
    let user = wx.getStorageSync('user');
    let User = new wx.BaaS.TableObject('user');
    let Attendees = new wx.BaaS.TableObject('attendees');
    let id = user.id;
    let query = new wx.BaaS.Query();

    query.compare('user', '=', User.getWithoutData(id));

    Attendees.setQuery(query).limit(100).expand(['workout']).find().then(res => {
      let workouts = res.data.objects.map(attendee => attendee.workout);
      this.sortDates(workouts);
    })
  },
  
  onLoad: function () {
    this.getMyWorkouts();
  }
})