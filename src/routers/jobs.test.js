const request = require('supertest');
const assert = require('assert');
const ContractModule = require('../models/contract');
const ProfileModule = require('../models/profile');

describe('Checking /jobs/unpaid', function() {
  let app;
  let server;
  beforeAll(async () => {
    app = require('../app');
    const { Contract, Profile, Job } = app.get('models');
    const s = app.get('sequelize');
    await s.sync({ force: true });
    await Promise.all([
      Profile.create({
        id: 1,
        firstName: 'Mr',
        lastName: 'Boss',
        profession: 'Boss',
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
      Profile.create({
        id: 3,
        firstName: 'Good',
        lastName: 'Boy',
        profession: 'Pro',
        balance: 1,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
      Contract.create({
        id: 1,
        terms: 'bla bla bla',
        status: ContractModule.statuses.Terminated,
        ClientId: 1,
        ContractorId: 2,
      }),
      Contract.create({
        id: 3,
        terms: 'fooo',
        status: ContractModule.statuses.InProgress,
        ClientId: 1,
        ContractorId: 2,
      }),
      Contract.create({
        id: 2,
        terms: 'bla bla bla',
        status: ContractModule.statuses.Terminated,
        ClientId: 1,
        ContractorId: 3,
      }),
      Job.create({
        id: 1,
        description: 'work',
        price: 201,
        paid: true,
        ContractId: 3,
      }),
      Job.create({
        id: 2,
        description: 'work',
        price: 202,
        ContractId: 3,
      }),
      Job.create({
        id: 3,
        description: 'work',
        price: 202,
        ContractId: 2,
      }),
    ]);
    await new Promise((resolve, reject) => {
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

  it('get all unpaid jobs for a user', async () => {
    await request(app)
        .get('/jobs/unpaid')
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(({ body }) => {
          assert.equal(body.length, 1);
          body.forEach((el) => {
            assert.equal(el.id, 2);
          });
        });
  });
});

describe('Checking /jobs/id:/pay', function() {
  let app;
  let server;
  beforeAll(async () => {
    app = require('../app');
    const { Contract, Profile, Job } = app.get('models');
    const s = app.get('sequelize');
    await s.sync({ force: true });
    await Promise.all([
      Profile.create({
        id: 1,
        firstName: 'Mr',
        lastName: 'Boss',
        profession: 'Boss',
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
      Profile.create({
        id: 3,
        firstName: 'Good',
        lastName: 'Boy',
        profession: 'Pro',
        balance: 1,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
      Contract.create({
        id: 1,
        terms: 'bla bla bla',
        status: ContractModule.statuses.Terminated,
        ClientId: 1,
        ContractorId: 2,
      }),
      Contract.create({
        id: 2,
        terms: 'fooo',
        status: ContractModule.statuses.InProgress,
        ClientId: 1,
        ContractorId: 2,
      }),
      Job.create({
        id: 1,
        description: 'work',
        price: 202,
        ContractId: 2,
      }),
    ]);
    await new Promise((resolve, reject) => {
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

  it('client pays for job', async () => {
    await request(app)
        .post('/jobs/1/pay')
        .send({ amount: 100 })
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(200);

    const { Profile } = app.get('models');
    const clientProfile = await Profile.findOne({
      where: {
        id: 1,
      },
    });
    const contractorProfile = await Profile.findOne({
      where: {
        id: 2,
      },
    });

    assert.equal(clientProfile.balance, 131.11);
    assert.equal(contractorProfile.balance, 1314);
  });
});
