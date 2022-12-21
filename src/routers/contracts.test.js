const request = require('supertest');

describe('Checking /contracts route', function() {
  let app;
  let server;
  beforeAll(function(done) {
    app = require('../app');
    server = app.listen(function(err) {
      if (err) {
        return done(err);
      }
      done();
    });
  });

  afterAll((done) => {
    server.close();
    done();
  });

  beforeEach(async () => {
    const { Contract, Profile } = app.get('models');
    const s = app.get('sequelize');
    await s.sync({ force: true });
    await Promise.all([
      Profile.create({
        id: 1,
        firstName: 'Mr',
        lastName: 'Robot',
        profession: 'Hacker',
        balance: 231.11,
        type: 'client',
      }),
      Profile.create({
        id: 2,
        firstName: 'Linus',
        lastName: 'Torvalds',
        profession: 'Programmer',
        balance: 1214,
        type: 'contractor',
      }),
      Contract.create({
        id: 1,
        terms: 'bla bla bla',
        status: 'terminated',
        ClientId: 1,
        ContractorId: 1,
      }),
    ]);
  });

  it('should work', async () => {
    await request(app)
        .get('/contracts/1')
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          // assert(response.body.email, 'foo@bar.com');
        });
  });
});
