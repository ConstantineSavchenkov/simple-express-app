const request = require('supertest');
const assert = require('assert');
const ContractModule = require('../models/contract');
const ProfileModule = require('../models/profile');

describe('Checking /admin/best-profession', function() {
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
        profession: 'HR',
        balance: 1,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
      Profile.create({
        id: 4,
        firstName: 'Good',
        lastName: 'Girl',
        profession: 'Killer',
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
        ContractorId: 3,
      }),
      Contract.create({
        id: 3,
        terms: 'fooo',
        status: ContractModule.statuses.InProgress,
        ClientId: 1,
        ContractorId: 4,
      }),
      Job.create({
        id: 1,
        description: 'work',
        price: 202,
        paid: true,
        paymentDate: '2020-08-16T19:11:26.737Z',
        ContractId: 1,
      }),
      Job.create({
        id: 2,
        description: 'work',
        price: 402,
        paid: true,
        paymentDate: '2020-08-17T19:11:26.737Z',
        ContractId: 2,
      }),
      Job.create({
        id: 3,
        description: 'work',
        paid: true,
        paymentDate: '2020-08-15T19:11:26.737Z',
        price: 602,
        ContractId: 3,
      }),
      Job.create({
        id: 4,
        description: 'work',
        price: 402000000,
        paid: true,
        paymentDate: '2030-08-17T19:11:26.737Z',
        ContractId: 2,
      }),
      Job.create({
        id: 5,
        description: 'work',
        price: 150,
        paid: true,
        paymentDate: '2020-08-17T19:11:26.737Z',
        ContractId: 1,
      }),
      Job.create({
        id: 6,
        description: 'work',
        price: 250,
        paid: true,
        paymentDate: '2020-08-17T19:11:26.737Z',
        ContractId: 1,
      }),
      Job.create({
        id: 7,
        description: 'work',
        price: 350,
        paid: true,
        paymentDate: '2020-08-17T19:11:26.737Z',
        ContractId: 1,
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

  it('happy path', async () => {
    await request(app)
        .get('/admin/best-profession')
        .query({
          start: '2020-08-15T19:11:26.737Z',
          end: '2020-09-15T19:11:26.737Z',
        })
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(({ body }) => {
          assert.equal(body, 'Programmer');
        });
  });
});

describe('Checking /admin/best-clients', function() {
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
        profession: 'HR',
        balance: 1,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
      Profile.create({
        id: 4,
        firstName: 'Good',
        lastName: 'Girl',
        profession: 'Killer',
        balance: 1,
        type: ProfileModule.ProfileTypes.Contractor,
      }),
      Profile.create({
        id: 5,
        firstName: 'Pak',
        lastName: 'Pook',
        profession: 'Mañana',
        balance: 10000000,
        type: ProfileModule.ProfileTypes.Client,
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
        ContractorId: 3,
      }),
      Contract.create({
        id: 3,
        terms: 'fooo',
        status: ContractModule.statuses.InProgress,
        ClientId: 5,
        ContractorId: 4,
      }),
      Job.create({
        id: 1,
        description: 'work',
        price: 202,
        paid: true,
        paymentDate: '2020-08-16T19:11:26.737Z',
        ContractId: 1,
      }),
      Job.create({
        id: 2,
        description: 'work',
        price: 402,
        paid: true,
        paymentDate: '2020-08-17T19:11:26.737Z',
        ContractId: 2,
      }),
      Job.create({
        id: 3,
        description: 'work',
        paid: true,
        paymentDate: '2020-08-15T19:11:26.737Z',
        price: 7020,
        ContractId: 3,
      }),
      Job.create({
        id: 4,
        description: 'work',
        price: 402000000,
        paid: true,
        paymentDate: '2030-08-17T19:11:26.737Z',
        ContractId: 2,
      }),
      Job.create({
        id: 5,
        description: 'work',
        price: 150,
        paid: true,
        paymentDate: '2020-08-17T19:11:26.737Z',
        ContractId: 1,
      }),
      Job.create({
        id: 6,
        description: 'work',
        price: 250,
        paid: true,
        paymentDate: '2020-08-17T19:11:26.737Z',
        ContractId: 1,
      }),
      Job.create({
        id: 7,
        description: 'work',
        price: 350,
        paid: true,
        paymentDate: '2020-08-17T19:11:26.737Z',
        ContractId: 1,
      }),
      Job.create({
        id: 8,
        description: 'work',
        price: 120,
        paid: true,
        paymentDate: '2020-08-17T19:17:26.737Z',
        ContractId: 3,
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

  it('limit 1', async () => {
    await request(app)
        .get('/admin/best-clients')
        .query({
          start: '2020-08-15T19:11:26.737Z',
          end: '2020-09-15T19:11:26.737Z',
          limit: 1,
        })
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(({ body }) => {
          assert(body.length, 1);
          assert.equal(body[0].paid, 7140 );
        });
  });

  it('limit 2', async () => {
    await request(app)
        .get('/admin/best-clients')
        .query({
          start: '2020-08-15T19:11:26.737Z',
          end: '2020-09-15T19:11:26.737Z',
          limit: 2,
        })
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(({ body }) => {
          assert(body.length, 2);
          assert.equal(body[0].paid, 7140 );
          assert.equal(body[0].fullName, 'Pak Pook' );
          assert.equal(body[0].id, 5 );
          assert.equal(Object.keys(body[0]).length, 3 );
          assert.equal(body[1].paid, 1354);
          assert.equal(body[1].id, 1);
        });
  });

  it('invalid date', async () => {
    await request(app)
        .get('/admin/best-clients')
        .query({
          start: 'cat',
          end: '2020-09-15T19:11:26.737Z',
          limit: 2,
        })
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(400);
  });

  it('invalid date format', async () => {
    await request(app)
        .get('/admin/best-clients')
        .query({
          start: '05/12/2007',
          end: '2020-09-15T19:11:26.737Z',
          limit: 2,
        })
        .set('Content-Type', 'application/json')
        .set('profile_id', 1)
        .expect(400);
  });
});
