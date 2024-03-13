
module.exports = {
    isOpened: async (horarios) => { },
    toCents: (price) => {
        return parseInt(price.toString().replace('.', "").replace(',', ''))
    },
    hoursToMinutes: (hourMinute) => {
        const [hour, minutes] = hourMinute.split(':')

        return parseInt(parseInt(hour) * 60 + parseInt(minutes))
    }
}