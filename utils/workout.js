const fetchAll = (user) => {
  return new Promise(resolve => {
    let User = new wx.BaaS.TableObject('user')
    let Attendees = new wx.BaaS.TableObject('attendees')
    let id = user.id
    let query = new wx.BaaS.Query()
  
    query.compare('user', '=', User.getWithoutData(id))
  
    Attendees.setQuery(query).limit(100).expand(['workout']).find().then(async res => {
      let workouts = res.data.objects.map(attendee => attendee.workout)
      let trainingDates = await sort(workouts)
      console.log(trainingDates)
      resolve(trainingDates)
    })
  })
}

const sort = (workouts) => {
  return new Promise(resolve => {
    let trainingDates = []
    let dateOptions = {weekday: "long", month: "long", day: "numeric"}
    let timeOptions = {hour: 'numeric', minute: '2-digit'}
    let today = new Date().toLocaleDateString([], dateOptions)

    workouts.forEach((workout) => {
      // -- Turn date to a locale date string
      let date = new Date(workout.date_time).toLocaleDateString('en-us', dateOptions)
      let time = new Date(workout.date_time).toLocaleTimeString('en-us', timeOptions)
      // -- Add time to the workout
      workout['time'] = time
      // -- Check to see if this workout's day already exists in the trainingDates array
      let existing_date = trainingDates.find(workout => workout.date === date);
      
      if (existing_date) {
        existing_date['workouts'].push(workout);
      } else {
        trainingDates.push({date, workouts: [workout]});
      }
    });

    // Check if today's date exists in the array; 
    let today_date = trainingDates.find(workout => workout.date == today);
    
    if (today_date) {
      today_date['today'] = true
    } else {
      trainingDates.push({date: today, today: true});
    }

    // Sort the array
    trainingDates = trainingDates.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // resolve
    console.log('end of sort', trainingDates)
    resolve(trainingDates)
  })
}

const fetchWithID = (id) => {
  return new Promise(resolve => {
    const Workout = new wx.BaaS.TableObject('workouts')
    Workout.get(id).then(res => {
      let workout = res.data;
      let dateOptions = {weekday: "long", month: "long", day: "numeric"}
      let timeOptions = {hour: 'numeric', minute: '2-digit'}

      workout.date = new Date(workout.date_time).toLocaleDateString('en-us', dateOptions);
      workout.time = new Date(workout.date_time).toLocaleTimeString('en-us', timeOptions);

      workout.name = workout.name.toUpperCase();
      
      resolve(workout)
    })
  })
}


module.exports = { fetchAll, fetchWithID }