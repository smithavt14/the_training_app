const time = () => {
    return {
        columns: [['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], ['00', '15', '30', '45'], ['AM', 'PM']],
        index: [0, 0, 0],
        active: false
    }
}
const date = () => {
    let milliseconds = 0
    let dateOptions = {weekday: "long", month: "long", day: "numeric", year: "numeric"}
    let column = []
    let today = new Date().toLocaleDateString('en-us', dateOptions)
    let tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-us', dateOptions)
    
    for (let i = 0; i < 14; i++) {
        let ms = Date.now() + milliseconds
        let fullDate = new Date(ms).toLocaleDateString('en-us', dateOptions)
        let alias

        if (fullDate === today) alias = 'Today'
        else if (fullDate === tomorrow) alias = 'Tomorrow'
        else alias = fullDate
        
        column.push({fullDate, alias})
        milliseconds += 86400000 // number of ms in 1 day
    }

    return { column, index: 0 }
}


module.exports = { time, date }