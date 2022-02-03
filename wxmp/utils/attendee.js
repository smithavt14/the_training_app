const findAllForWorkout = (workout, user) => {
  return new Promise(resolve => {
      let Attendees = new wx.BaaS.TableObject('attendees')
      let query = new wx.BaaS.Query();
  
      query.compare('workout', '=', workout.id)
  
      Attendees.setQuery(query).limit(100).expand('user').select(['id', 'user.avatar', 'user.nickname', 'user.id']).find().then(res => {
          let attendees = res.data.objects

          // Identify whether user is an attendee;
          let user_attendee = attendees.find(attendee => attendee.user.id === user.id)
          
          if (user_attendee) user['attendee'] = user_attendee.id 
          user['is_attending'] = !!user_attendee

          resolve([attendees, user])
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

const fetchAllForUser = (user, active) => {
  return new Promise(resolve => {
    let Attendees = new wx.BaaS.TableObject('attendees')
    let id = user.id
    let query = new wx.BaaS.Query()
  
    query.compare('user', '=', id)
  
    Attendees.setQuery(query).limit(50).expand('workout').orderBy(['workout.start_date_time']).find().then(async res => {
      let workouts = res.data.objects.map(attendee => attendee.workout)
      workouts = workouts.sort((a, b) => new Date(b.start_date_time) - new Date(a.start_date_time))
      
      resolve(workouts)
    })
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