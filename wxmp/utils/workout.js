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

const setTrainingDates = (workouts) => {
  return new Promise(resolve => {
    let trainingDates = []
    let dateOptions = {weekday: "long", month: "long", day: "numeric", year: "numeric"}
    let timeOptions = {hour: 'numeric', minute: '2-digit'}
    let today = new Date().toLocaleDateString([], dateOptions)

    workouts.forEach((workout) => {
      // -- Turn date to a locale date string
      let date = new Date(workout.start_date_time).toLocaleDateString('en-us', dateOptions)
      let start = new Date(workout.start_date_time).toLocaleTimeString('en-us', timeOptions)
      let end = new Date(workout.end_date_time).toLocaleTimeString('en-us', timeOptions)
      
      // -- Add time to the workout
      workout['time'] = { start, end }
      workout['date'] = date
      
      // -- Check to see if this workout's day already exists in the trainingDates array
      let existing_date = trainingDates.find(workout => workout.date === date);

      // -- Indicate whether workout is in the past or not -- 
      workout['completed'] = new Date(workout.start_date_time) < new Date()
      
      // -- Push workouts into calendar dates --
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

    trainingDates = trainingDates.sort((a, b) => {return new Date(b.date) - new Date(a.date)})
    
    // resolve
    resolve(trainingDates)
  })
}

const sortPastUpcoming = (workouts) => {
  return new Promise(resolve => {

    let sortedWorkouts = { 
      upcoming: workouts.filter((workout) => { return Date.parse(workout.start_date_time) >= Date.now() }),
      past: workouts.filter((workout) => { return Date.parse(workout.start_date_time) < Date.now() })
    }

    resolve(sortedWorkouts)
  })
}

const getCreatorInfo = (workouts) => {
  return new Promise(resolve => {
    let User = new wx.BaaS.User()
    let promises = []
    workouts.forEach(workout => {
      promises.push(
        User.get(workout.created_by).then(res => { workout['creator'] = res.data })
      )
    })
    Promise.all(promises).then(res => { resolve(workouts) })
  })
}

const create = (workout) => {
  return new Promise(resolve => {
    let Workouts = new wx.BaaS.TableObject('workouts')
    let new_workout = Workouts.create()

    workout['start_date_time'] = new Date(workout.date + ' ' + workout.time.start).toISOString()
    if (workout.time.end) workout['end_date_time'] = new Date(workout.date + ' ' + workout.time.end).toISOString()

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


module.exports = { fetchWithID, setTrainingDates, getCreatorInfo, edit, create, sortPastUpcoming }