Page({
    data: {
        category: {
            active: 0,
            items: ['Run', 'HIIT', 'Ride', 'Swim', 'Recovery']
        }, 
        date: {
            active: false,
        }
    }, 
    
    changeCategory: function (e) {
        const active = e.detail.value;
        this.setData({'category.active': active})
    },

    setDate: function () {
        const now = new Date(Date.now())
        let end = new Date(Date.now())
        end = new Date(end.setDate(end.getDate() + 28))
        
        const year = now.getFullYear()
        const month = now.getMonth() < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1
        const day = now.getDate()
        const start = `${year}-${month}-${day}`

        const yearEnd = end.getFullYear()
        const monthEnd = end.getMonth() < 10 ? `0${end.getMonth() + 1}` : end.getMonth() + 1
        const dayEnd = end.getDate()
        end = `${yearEnd}-${monthEnd}-${dayEnd}`

        this.setData({'date.start': start})
        this.setData({'date.end': end})
    },

    changeTitle: function (e) {
        this.setData({title: e.detail.value})
    },

    changeDate: function (e) {
        const options = {year: 'numeric', month: 'long', weekday: 'long', day: 'numeric'}
        const selected = new Date(e.detail.value).toLocaleDateString('en-us', options)
        
        this.setData({'date.active': true, 'date.selected': selected})
    },

    changeLocation: function (e) {
        wx.chooseLocation({
            success: (res) => {
                console.log(res)
            }, 
            fail: res => console.log(res)
        })
    },

    onLoad: function () {
        this.setDate()
    }
})