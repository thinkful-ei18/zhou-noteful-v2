const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;
chai.use(chaiHttp);
chai.use(chaiSpies);

const knex = require('../knex');
const seedData = require('../db/seed/index');

before(function () {
  console.log('before hook')
  // noop
});

beforeEach(function () {
  console.log('before each test run seeding')
  return seedData();
});

afterEach(function () {
  console.log('after each test')
  // noop
});

after(function () {
  console.log('after all test complete shut knex')
  // destroy the connection
  return knex.destroy();
});

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});



describe('Express static', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});

describe('Environment', () => {
  it('NODE_ENV should be "test"', () => {
    expect(process.env.NODE_ENV).to.equal('test');
  });

  it('connection should be test database', () => {
    expect(knex.client.connectionSettings.database).to.equal('noteful_test');
  });

});

describe('/v2/notes GET route', function(){
  it('should return the default of 10 Notes ', function () {
    let count;
    return knex.count()
      .from('notes')
      .then(([result]) => {
        count = Number(result.count);
        return chai.request(app).get('/v2/notes');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(count);
      });
  });
  it('should return correct search results for a searchTerm query', function () {
    let res;
    return chai.request(app).get('/v2/notes?searchTerm=gaga')
      .then(function (_res) {
        res = _res;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(1);
        expect(res.body[0]).to.be.an('object');
        return knex.select().from('notes').where('title', 'like', '%gaga%');
      })
      .then(data => {
        expect(res.body[0].id).to.equal(data[0].id);
      })
  })

  it('should search by folder id', function () {
    const dataPromise = knex.select()
      .from('notes')
      .where('folder_id', 103)
      .orderBy('notes.id');

    const apiPromise = chai.request(app)
      .get('/v2/notes?folderId=103');

    return Promise.all([dataPromise, apiPromise])
      .then(function ([data, res]) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(2);
        expect(res.body[0]).to.be.an('object');
      });
  });

  it('should create and return a new item when provided valid data', function () {
    const newItem = {
      'title': 'The best article about cats ever!',
      'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
      'tags': []
    };
    let body;
    return chai.request(app)
      .post('/v2/notes')
      .send(newItem)
      .then(function (res) {
        body = res.body;
        expect(res).to.have.status(201);
        expect(res).to.have.header('location');
        expect(res).to.be.json;
        expect(body).to.be.a('object');
        expect(body).to.include.keys('id', 'title', 'content');
        return knex.select().from('notes').where('id', body.id);
      })
      .then(([data]) => {
        expect(body.title).to.equal(data.title);
        expect(body.content).to.equal(data.content);
      });
  });
})