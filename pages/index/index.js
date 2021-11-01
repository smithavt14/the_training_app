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
    let dateOptions = {weekday: "long", month: "long", day: "numeric"}
    let timeOptions = {hour: 'numeric', minute: '2-digit'}
    let today = new Date().toLocaleDateString([], dateOptions)
    
    // -- 1. Iterate through each workout
    workouts.forEach((workout) => {
      // -- 2. Turn date to a locale date string
      let date = new Date(workout.date_time).toLocaleDateString('en-us', dateOptions)
      let time = new Date(workout.date_time).toLocaleTimeString('en-us', timeOptions)
      // -- 2a. Add time to the workout
      workout['time'] = time
      // -- 3. Check to see if this workout's day already exists in the trainingDates array
      let existing_date = trainingDates.find(workout => workout.date === date);
      
      if (existing_date) {
        existing_date['workouts'].push(workout);
      } else {
        trainingDates.push({date, workouts: [workout]});
      }
    });

    // -- 4. Check if today's date exists in the array; 
    let today_date = trainingDates.find(workout => workout.date == today);
    
    if (today_date) {
      today_date['today'] = true
    } else {
      trainingDates.push({date: today, today: true});
    }

    // -- 5. Sort the array
    trainingDates = trainingDates.sort((a, b) => new Date(a.date) - new Date(b.date))
  
    this.setData({trainingDates});
    this.scrollToToday();
  },

  scrollToToday: function () {
    wx.pageScrollTo({
      selector: '#today',
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