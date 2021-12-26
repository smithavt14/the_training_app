const fetchWithID = (id) => {
  return new Promise(resolve => {
    const Workout = new wx.BaaS.TableObject('workouts')
    Workout.expand('created_by').get(id).then(res => {
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


module.exports = { fetchWithID }