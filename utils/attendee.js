const findAll = (workout, user) => {
    return new Promise(resolve => {
        let Attendees = new wx.BaaS.TableObject('attendees');
        let query = new wx.BaaS.Query();
    
        query.compare('workout', '=', workout.id);
    
        Attendees.setQuery(query).expand(['user']).find().then(res => {
            let createdBy = workout.created_by
            let attendees = res.data.objects;
            
            // Identify whether user is an attendee;
            user['is_attending'] = attendees.some(attendee => attendee.user.id === user.id);
            
            // Find the creator, separate him from the attendee list; 
            const index = attendees.findIndex(attendee => attendee.user.id === createdBy);
            const creator = attendees[index];
            attendees.splice(0, 1);
    
            // Check if user is creator; 
            if (creator) {
                user['is_creator'] = creator.user.id === user.id; 
            } else  {
                user['is_creator'] = false
            }
            resolve({attendees, user, creator, workout})
        })
    })
}

const create = (user, workout) => {
    return new Promise(resolve => {
        let Attendees = new wx.BaaS.TableObject('attendees');
        let attendee = Attendees.create();

        let details = {user: user.id, workout: workout.id}

        attendee.set(details).save().then(() => {
            wx.showModal({title: 'Success!', icon: 'success'})
            resolve()
        });
    })
}

const remove = (attendee) => {
    return new Promise(resolve => {
        let Attendees = new wx.BaaS.TableObject('attendees');
        Attendees.delete(attendee.id).then(() => { resolve() })
    })
}

module.exports = { findAll, create, remove }