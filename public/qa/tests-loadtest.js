const loadtest = require('loadtest')
const expect = require('chai').expect

suiteTeardown('Stress tests', () => {
    test('Homepage should handle 100 requests in a second', (done) => {
        const options = {
            url: 'http://localhost:3000',
            concurrency: 4,
            maxRequests: 100
        }

        loadtest.loadTest(options, (err, result) => {
            expect(!err)
            expect(result.totalTimeSeconds < 1)
            done()
        })
    })
})