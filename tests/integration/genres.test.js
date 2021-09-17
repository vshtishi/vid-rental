const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');
const { templateSettings } = require('lodash');


let server;

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../index') });
    afterEach(async () => {
        await server.close();
        await Genre.deleteMany({});
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

        it('should return 404 if the genre with the given id does not exist', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/genres/' + id);

            expect(res.status).toBe(404);
        });

    });

    describe('POST /', () => {
        let token;
        let name;

        const exec = () => {
            return request(server).post('/api/genres').set('x-auth-token', token).send({ name });
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
    });


    describe('PUT /:id', () => {
        let token;
        let updatedName;
        let genre;
        let id;

        const exec = () => {
            return request(server).put('/api/genres/' + id).set('x-auth-token', token).send({ name: updatedName });
        }

        beforeEach(async () => {

            genre = new Genre({ name: 'genre1' });
            await genre.save();

            token = new User().generateAuthToken();
            id = genre._id;
            updatedName = 'testing';
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            updatedName = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            updatedName = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if genre with the given id was not found', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should update the genre if input is valid', async () => {
            await exec();

            const updatedGenre = await Genre.findById(genre._id);

            expect(updatedGenre.name).toBe(updatedName);
        });

        it('should return the updated genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', updatedName);
        });
    });

    describe('DELETE /:id', () => {
        let genre;
        let id;
        let token;

        beforeEach(async () => {
            genre = new Genre({ name: 'Testing' });
            await genre.save();
            id = genre._id;
            token = new User({ name: 'user1', isAdmin: true }).generateAuthToken();
        });

        const exec = () => {
            return request(server).delete('/api/genres/' + id).set('x-auth-token', token).send();
        }

        it('should return 401 if the user is not logged in', async () => {
            token = '';

            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not admin', async () => {
            token = new User({ name: 'user1', isAdmin: false }).generateAuthToken();

            const res = await exec();
            expect(res.status).toBe(403);
        });

        it('should return 404 if the genre with the given id is not found', async () => {
            id = 1;

            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return the deleted genre if it was deleted successfully', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name');

        });

        it('should delete the genre', async () => {
            const res = await exec();

            const dbGenre = await Genre.findById(id);

            expect(dbGenre).toBeNull;
        })
    });

});

