const categories = [
    {name: 'Yoga', icon: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nF9X6H85abSttNC.svg'},
    {name: 'Metcon', icon: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nF9X6c1SfNopmXp.svg'},
    {name: 'Swim', icon: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nF9X6vEBGXAKTb5.svg'},
    {name: 'Aerobic Run', icon: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nF9X6rUV4rvR1Z4.svg'},
    {name: 'Tempo Run', icon: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nF9X6pgoKkleirP.svg'},
    {name: 'Track Workout', icon: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nF9X6CNkCqpWVQ3.svg'},
    {name: 'Trail Run', icon: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nF9X63Lp2eg2bpp.svg'},
    {name: 'Long Run', icon: 'https://cloud-minapp-40635.cloud.ifanrusercontent.com/1nF9X6x6qWkbEP8f.svg'}
]

const categoryNames = categories.map(category => { return category.name })

module.exports = { categoryNames, categories }