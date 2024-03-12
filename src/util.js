
module.exports = {
    isOpened: async (horarios) => { },
    toCents: (price) => {
        return parseInt(price.toString().replace('.', "").replace(',', ''))
    }
}