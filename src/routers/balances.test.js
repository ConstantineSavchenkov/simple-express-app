const request = require('supertest');
const assert = require('assert');
const ContractModule = require('../models/contract');
const ProfileModule = require('../models/profile');

describe('Checking /balances/deposit/:userId', function() {
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
      Job.create({
        id: 2,
        description: 'work',
        price: 402,
        ContractId: 2,
      }),
      Job.create({
        id: 3,
        description: 'work',
        price: 602,
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

  it('correct sum for money deposit', async () => {
    await request(app)
        .post('/balances/deposit/1')
        .send({ amount: 50 })
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(200);

    const { Profile } = app.get('models');
    const clientProfile = await Profile.findOne({
      where: {
        id: 1,
      },
    });

    assert.equal(clientProfile.balance, 281.11);
  });

  it('incorrect sum for money deposit', async () => {
    const { Profile } = app.get('models');
    const { balance } = await Profile.findOne({
      where: {
        id: 1,
      },
    });
    await request(app)
        .post('/balances/deposit/1')
        .send({ amount: 700 })
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(400);

    const clientProfile = await Profile.findOne({
      where: {
        id: 1,
      },
    });

    assert.equal(clientProfile.balance, balance);
  });

  it('deposit to another user', async () => {
    await request(app)
        .post('/balances/deposit/2')
        .send({ amount: 500 })
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(403);
  });
});
