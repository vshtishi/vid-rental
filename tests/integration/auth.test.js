const request = require('supertest');
const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');

let server;

describe('auth middleware', () => {
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(async () => {
        await Genre.deleteMany({});
        await server.close();
    });

   
    let token;
    
    const exec = () => {
        return request(server).post('/api/genres').set('x-auth-token', token).send({ name: 'genre' });
    }


    beforeEach(() => {
        token = new User().generateAuthToken();
    });

   


    it('should return 401 if no token is provided', async () => {
        token = '';
        const res = await exec();

        expect(res.status).toBe(401);
    });
})