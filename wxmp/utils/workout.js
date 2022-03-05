const _category = require('/category.js')

const fetchWithID = (id) => {
  return new Promise(resolve => {
    const Workout = new wx.BaaS.TableObject('workouts')
    Workout.expand('created_by').get(id).then(res => {
      let workout = res.data;
      let dateOptions = {year: 'numeric', weekday: "long", month: "long", day: "numeric"}
      let timeOptions = {hour: 'numeric', minute: '2-digit'}

      let date = new Date(workout.start_date_time).toLocaleDateString('en-us', dateOptions)
      let start = new Date(workout.start_date_time).toLocaleTimeString('en-us', timeOptions)
      let end = workout.end_date_time ? new Date(workout.end_date_time).toLocaleTimeString('en-us', timeOptions) : ''

      workout['time'] = {start, end}
      workout['date'] = date
      workout.name = workout.name.toUpperCase()

      resolve(workout)
    })
  })
}

const fetchAllForUser = (user, active) => {
  return new Promise(resolve => {
    const Workout = new wx.BaaS.TableObject('workouts')
    let query = new wx.BaaS.Query()
    let today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today = today.toISOString()

    let operator = active === 'upcoming' ? '>=' : '<'

    query.arrayContains('attendees', [user.id])
    query.compare('start_date_time', operator, today)

    Workout.setQuery(query).limit(20).expand('created_by').find().then(res => {
      resolve(res.data.objects)
    })
  })
}

const setTrainingDates = (workouts, active) => {
  return new Promise(resolve => {
    let trainingDates = []
    let dayOptions = {weekday: "long"}
    let dateOptions = {month: "long", day: "numeric", year: "numeric"}
    let timeOptions = {hour: 'numeric', minute: '2-digit'}

    workouts.forEach((workout) => {
      // -- Turn date to a locale date string
      let today = new Date().toLocaleDateString('en-us', dateOptions)
      let tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-us', dateOptions)
      let date = new Date(workout.start_date_time).toLocaleDateString('en-us', dateOptions)
      let day = new Date(workout.start_date_time).toLocaleDateString('en-us', dayOptions)
      let start = new Date(workout.start_date_time).toLocaleTimeString('en-us', timeOptions)
      let end = new Date(workout.end_date_time).toLocaleTimeString('en-us', timeOptions)
      
      // -- Add time to the workout
      workout['time'] = { start, end }
      workout['date'] = date
      
      // -- Remove Day if past workout
      day = active === 'upcoming' ? day : false

      // -- Add alias to training day if any --
      let alias
      if (active === 'upcoming') {
        if (today === workout.date) { alias = 'Today' }
        else if (tomorrow === workout.date) { alias = 'Tomorrow' }
        else { alias = 'Upcoming' }
      }
      
      // -- Check to see if this workout's day already exists in the trainingDates array
      let existing_date = trainingDates.find(workout => workout.date === date);
      
      // -- Push workouts into calendar dates --
      if (existing_date) {
        existing_date['workouts'].push(workout);
      } else {
        trainingDates.push({date, day, alias, workouts: [workout]});
      }
    });

    trainingDates = trainingDates.sort((a, b) => {
      return active === 'upcoming' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
    })
    
    // resolve
    resolve(trainingDates)
  })
}

const sortPastUpcoming = (workouts) => {
  return new Promise(resolve => {

    let today = new Date()

    let upcoming = workouts.filter((workout) => { 
      let workoutDate = new Date(workout.start_date_time)
      return workoutDate >= today 
    })

    let past = workouts.filter((workout) => { 
      let workoutDate = new Date(workout.start_date_time)
      return workoutDate < today 
    })
    resolve({ upcoming, past })
  })
}

const create = (workout, user) => {
  return new Promise(resolve => {
    let Workouts = new wx.BaaS.TableObject('workouts')
    let new_workout = Workouts.create()

    workout['start_date_time'] = new Date(workout.date + ' ' + workout.time.start).toISOString()
    if (workout.time.end) workout['end_date_time'] = new Date(workout.date + ' ' + workout.time.end).toISOString()

    console.log(user.id, typeof(user.id))
    workout['attendees'] = [user.id]

    new_workout.set(workout).save().then(res => resolve(res))
  })
}

const edit = (workout) => {
  return new Promise(resolve => {
    let Workouts = new wx.BaaS.TableObject('workouts')
    let existing_workout = Workouts.getWithoutData(workout.id)

    workout['start_date_time'] = new Date(workout.date + ' ' + workout.time.start).toISOString()
    workout['end_date_time'] = new Date(workout.date + ' ' + workout.time.end).toISOString()
    workout.created_by = workout.created_by.id

    existing_workout.set(workout).update().then(res => resolve(res))
  })
}

// --- Attendee Related Functions --- 

const addAttendee = (workoutID, userID) => {
  return new Promise(resolve => {
    let Workouts = new wx.BaaS.TableObject('workouts')
    let workout = Workouts.getWithoutData(workoutID)
    
    workout.append('attendees', userID)
    workout.update().then(res => {
      console.log(res)
      wx.showToast({title: "You're Going!", icon: 'success'})
      resolve(res.data)
    })
  })
}

const removeAttendee = (workoutID, userID) => {
  return new Promise(resolve => {
    let Workouts = new wx.BaaS.TableObject('workouts')
    let workout = Workouts.getWithoutData(workoutID)

    workout.remove('attendees', userID)
    workout.update().then(res => resolve(res.data))
  })
}

const getAttendeeInfo = (workout) => {
  return new Promise(resolve => {
    let User = new wx.BaaS.User()
    let query = new wx.BaaS.Query()
    query.in('id', workout.attendees)
    User.setQuery(query).find().then(res => {
      resolve(res.data.objects)
    })
  })
}


module.exports = { fetchWithID, fetchAllForUser, setTrainingDates, edit, create, sortPastUpcoming, addAttendee, removeAttendee, getAttendeeInfo }