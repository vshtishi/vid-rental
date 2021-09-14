const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');


let server;

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../index') });
    afterEach(async () => {
        server.close();
        await Genre.remove({});
    });

    describe('GET /', () => {
        it('should return all genres', async () => {

            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return the genre if a valid id is passed', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server).get('/api/genres/' + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return 404 if the id is invalid', async () => {
            const res = await request(server).get('/api/genres/1');

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {
        let token;
        let name;

        const exec = async () => {
            return await request(server).post('/api/genres').set('x-auth-token', token).send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre'
        });
        
        it('should return 401 if client is not logged', async () => {
            token = ''
            const res = await exec();

            expect(res.status).toBe(401);

        });

        it('should return 400 if genre is invalid (less than 5 chars)', async () => {
            name = 'test'

            const res = await exec();

            expect(res.status).toBe(400);

        });

        it('should return 400 if genre is invalid (more than 50 chars)', async () => {
            name = new Array(52).join('a')

            const res = await exec();

            expect(res.status).toBe(400);

        });

        it('should save the genre if it is valid', async () => {
            await exec();
            const genre = await Genre.find({ name: 'genre' });

            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {

            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre');
        });
    })
});

