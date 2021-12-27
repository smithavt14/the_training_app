const findAllForWorkout = (workout, user) => {
  return new Promise(resolve => {
      let Attendees = new wx.BaaS.TableObject('attendees')
      let query = new wx.BaaS.Query();
  
      query.compare('workout', '=', workout.id)
  
      Attendees.setQuery(query).expand('user').select(['id', 'user.avatar', 'user.nickname', 'user.id']).find().then(res => {
          let attendees = res.data.objects

          // Identify whether user is an attendee;
          let user_attendee = attendees.find(attendee => attendee.user.id === user.id)
          
          if (user_attendee) user['attendee'] = user_attendee.id 
          user['is_attending'] = !!user_attendee

          resolve({attendees, user, workout})
      })
  })
}

const findAttendee = (workout, user) => {
  return new Promise(resolve => {
    let Attendees = new wx.BaaS.TableObject('attendees')
    let query = new wx.BaaS.Query()

    query.compare('workout', '=', workout.id)
    query.compare('user', '=', user.id)

    Attendees.setQuery(query).find().then(res => {
      resolve(res.data.objects[0])
    })
  })
}

const fetchAllForUser = (user) => {
  return new Promise(resolve => {
    let Attendees = new wx.BaaS.TableObject('attendees')
    let id = user.id
    let query = new wx.BaaS.Query()
  
    query.compare('user', '=', id)
  
    Attendees.setQuery(query).limit(20).expand('workout').orderBy(['-workout.date_time']).find().then(async res => {
      let workouts = res.data.objects.map(attendee => attendee.workout)
      let trainingDates = await sort(workouts)
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
      workout['date'] = date
      // -- Check to see if this workout's day already exists in the trainingDates array
      let existing_date = trainingDates.find(workout => workout.date === date);

      // -- Indicate whether workout is in the past or not -- 
      workout['completed'] = new Date(workout.date_time) < new Date()
      
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

    // Sort the array
    trainingDates = trainingDates.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // resolve
    resolve(trainingDates)
  })
}

const create = (user, workout) => {
  return new Promise(resolve => {
      let Attendees = new wx.BaaS.TableObject('attendees');
      let attendee = Attendees.create();

      let details = {user: user.id, workout: workout.id}

      attendee.set(details).save().then(() => {
          wx.showToast({title: "You're Going!", icon: 'success'})
          resolve()
      });
  })
}

const remove = (attendee) => {
  return new Promise(resolve => {
      let Attendees = new wx.BaaS.TableObject('attendees');
      Attendees.delete(attendee).then(() => { resolve() })
  })
}

module.exports = { findAllForWorkout, findAttendee, fetchAllForUser, create, remove }