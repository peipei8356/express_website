const fortune = require('../../lib/fortunes.js')
const expect = require('chai').expect

suite('Fortune cookie tests', () => {
    test('getFortune() should return a fortune', () => {
        expect(typeof fortune.getFortunes() === 'string')
    })
})