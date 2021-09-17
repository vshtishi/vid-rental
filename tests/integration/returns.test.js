const moment = require('moment');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const request = require('supertest');
const mongoose = require('mongoose');
const { Movie } = require('../../models/movie');

let server;

describe('/api/returns', () => {

    let customerId;
    let movieId;
    let rental;
    let token;
    let movie;

    const exec = () => {
        return request(server).post('/api/returns').set('x-auth-token', token).send({ customerId, movieId });
    }

    beforeEach(async () => {
        server = require('../../index');
        token = new User().generateAuthToken();
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        movie = new Movie({
            _id: movieId,
            title: 'Sample Title',
            dailyRentalRate: 10,
            genre: { name: 'Test Genre' },
            numberInStock: 10
        });

        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: 'Testing',
                phone: '1234567891'
            },
            movie: {
                _id: movieId,
                title: 'Sample Title',
                dailyRentalRate: 10
            }
        });

        await rental.save();
    });

    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
    });


    it('should return 401 if user is not logged in', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async () => {
        movieId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found with the given customer & movie ids', async () => {
        await Rental.deleteMany({});

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('should return 400 if the rental has been processed', async () => {
        rental.returnDate = new Date();
        await rental.save();
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if the rental is valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);

    });

    it('should set the return date', async () => {
        const res = await exec();

        const dbRental = await Rental.findById(rental._id);
        const diff = new Date() - dbRental.returnDate;
        expect(diff).toBeLessThan(10 * 1000);

    });

    it('should calculate the rentalFee', async () => {
        rental.orderDate = moment().add(-7, 'days').toDate();
        await rental.save();
        const res = await exec();

        const dbRental = await Rental.findById(rental._id);

        expect(dbRental.rentalFee).toBe(70);
    });

    it('should increment the movie stock', async () => {

        const res = await exec();

        const dbMovie = await Movie.findById(movieId);

        expect(dbMovie.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental if the request is valid', async () => {

        const res = await exec();

        const dbRental = await Rental.findById(rental._id);
        expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['movie', 'returnDate', 'orderDate', 'rentalFee']));
    });
});