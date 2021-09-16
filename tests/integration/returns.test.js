const {Rental} = require('../../models/rental');
const {User} = require('../../models/user');
const request = require('supertest');
const mongoose = require('mongoose');

let server;

describe('/api/returns', () => {

    let customerId;
    let movieId;
    let rental;
    let token;

    beforeEach(async () => { 
        server = require('../../index');
        token = new User.generateAuthToken();
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: 'Testing',
                phone: '1234567891'
            },
            movie: {
                _id: movieId,
                title: 'Sample Title',
                dailyRentalRate: 100
            }
        });

        await rental.save();
    });

    afterEach(async () => {
        server.close();
        Rental.deleteMany({});
    });

    it('should return 401 if user is not logged in', async () => {
        token = ''
       
        const res = await exec();

        expect(res.status).toBe(401);
    })
});