const request = require('supertest');
const assert = require('assert');
const ContractModule = require('../models/contract');
const ProfileModule = require('../models/profile');

describe('Checking /contracts/:id', function() {
  let app;
  let server;
  beforeAll(async () => {
    app = require('../app');
    const { Contract, Profile } = app.get('models');
    const s = app.get('sequelize');
    await s.sync({ force: true });
    await Promise.all([
      Profile.create({
        firstName: 'Mr',
        lastName: 'Robot',
        profession: 'Hacker',
        balance: 231.11,
        type: ProfileModule.ProfileTypes.Client,
      }),
      Profile.create({
        firstName: 'Linus',
        lastName: 'Torvalds',
        profession: 'Programmer',
        balance: 1214,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
      Contract.create({
        terms: 'bla bla bla',
        status: ContractModule.statuses.Terminated,
        ClientId: 1,
        ContractorId: 1,
      }),
      Profile.create({
        id: 66,
        firstName: 'Mr',
        lastName: 'Been',
        profession: 'Hacker',
        balance: 231.11,
        type: ProfileModule.ProfileTypes.Client,
      }),
      Profile.create({
        id: 77,
        firstName: 'Linus',
        lastName: 'Pipus',
        profession: 'Pro',
        balance: 1214,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
      Contract.create({
        id: 2,
        terms: 'bla bla bla',
        status: ContractModule.statuses.Terminated,
        ClientId: 77,
        ContractorId: 66,
      }),
    ]);
    await new Promise((resolve, reject)=>{
      server = app.listen(function(err) {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });

  afterAll((done) => {
    server.close();
    done();
  });

  it('return only if it belongs to the profile calling', async () => {
    await request(app)
        .get('/contracts/2')
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(404);
  });

  it('wrong params', async () => {
    await request(app)
        .get('/contracts/err')
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(400);
  });

  it('happy path', async () => {
    await request(app)
        .get('/contracts/1')
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(({ body }) => {
          assert.equal(body.id, 1);
        });
  });
});

describe('Checking /contracts', function() {
  let app;
  let server;
  beforeAll(async () => {
    app = require('../app');
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
        type: ProfileModule.ProfileTypes.Client,
      }),
      Profile.create({
        id: 2,
        firstName: 'Linus',
        lastName: 'Torvalds',
        profession: 'Programmer',
        balance: 1214,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
      Contract.create({
        id: 1,
        terms: 'bla bla bla',
        status: ContractModule.statuses.Terminated,
        ClientId: 1,
        ContractorId: 1,
      }),
      Contract.create({
        id: 3,
        terms: 'fooo',
        status: ContractModule.statuses.InProgress,
        ClientId: 1,
        ContractorId: 1,
      }),
      Profile.create({
        id: 66,
        firstName: 'Mr',
        lastName: 'Been',
        profession: 'Hacker',
        balance: 231.11,
        type: ProfileModule.ProfileTypes.Client,
      }),
      Profile.create({
        id: 77,
        firstName: 'Linus',
        lastName: 'Pipus',
        profession: 'Pro',
        balance: 1214,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
      Contract.create({
        id: 2,
        terms: 'bla bla bla',
        status: ContractModule.statuses.Terminated,
        ClientId: 77,
        ContractorId: 66,
      }),
      Profile.create({
        id: 777,
        firstName: 'Good',
        lastName: 'Boy',
        profession: 'Pro',
        balance: 1,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
    ]);
    await new Promise((resolve, reject)=>{
      server = app.listen(function(err) {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });

  afterAll((done) => {
    server.close();
    done();
  });

  it('no contracts', async () => {
    await request(app)
        .get('/contracts')
        .set('Content-Type', 'application/json')
        .set('profile_id', 777)
        .expect(404);
  });

  it('returns only non terminated', async () => {
    await request(app)
        .get('/contracts')
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(({ body }) => {
          assert.equal(body.length, 1);
          body.forEach((el)=>{
            assert.notEqual(el.status, ContractModule.statuses.Terminated);
          });
        });
  });
});
