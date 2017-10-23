const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const {PORT, DATABASE_URL} = require('../config');
const {Blog} = require('../models');

const {app, runServer, closeServer} = require('../server');

// this lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


describe('Blog API', function() {

  // Before our tests run, we activate the server. Our `runServer`
  // function returns a promise, and we return the that promise by
  // doing `return runServer`. If we didn't return a promise here,
  // there's a possibility of a race condition where our tests start
  // running before our server has started.
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  // test strategy:
  //   1. make request to `/posts`
  //   2. inspect response object and prove has right code and have
  //   right keys in response object.
  it('should list items on GET', function() {
    // for Mocha tests, when we're dealing with asynchronous operations,
    // we must either return a Promise object or else call a `done` callback
    // at the end of the test. The `chai.request(server).get...` call is asynchronous
    // and returns a Promise, so we just return it.
    return chai.request(app)
      .get('/posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');

        // because we create two items on app load
        res.body.length.should.be.at.least(1);
        // each item should be an object with key/value pairs
        // for `title`, `content` and `author`.
        const expectedKeys = ['title', 'content', 'author'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  // test strategy:
  //  1. make a POST request with data for a new item
  //  2. inspect response object and prove it has right
  //  status code and that the returned object has an `id`
  it('should add an item on POST', function() {
    const newItem = {title: 'Garfield and Psychoanalysis', content: 'Lorem ipsum dolor sit amet, quod tantas labore ut his, mei ea nominati delicatissimi, ut sit malis errem definitiones. Has id harum vivendum persecuti, sed dicant menandri in. In delicata definiebas pri, mei libris appareat adipisci no, errem detraxit neglegentur at per. Nec ridens democritum liberavisse at. Magna errem legimus ei historum.',
    author: {firstName: 'Sigmund', lastName: 'Freud'} };
    return chai.request(app)
      .post('/posts')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('title', 'content', 'author');
        res.body.id.should.not.be.null;
        // response should be deep equal to `newItem` from above if we assign
        // `id` to it from `res.body.id`
        // res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
        res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id, publishDate: res.body.publishDate}));
      });
  });

  // test strategy:
  //  1. initialize some update data (we won't have an `id` yet)
  //  2. make a GET request so we can get an item to update
  //  3. add the `id` to `updateData`
  //  4. Make a PUT request with `updateData`
  //  5. Inspect the response object to ensure it
  //  has right status code and that we get back an updated
  //  item with the right data in it.
  it('should update items on PUT', function() {
    // we initialize our updateData here and then after the initial
    // request to the app, we update it with an `id` property so
    // we can make a second, PUT call to the app.
    const updateData = {
      title: 'Foobar Garfield Mayday',
      content: 'n delicata definiebas pri, mei libris appareat adipisci no, errem detraxit neglegentur at per. Nec ridens democritum liberavisse at.',
      author: {firstName: 'Johnny', lastName: 'Carson'}
    };

    return chai.request(app)
      // first have to get so we have an idea of object to update
      .get('/posts')
      .then(function(res) {
        updateData.id = res.body[0].id;

        // this will return a promise whose value will be the response
        // object, which we can inspect in the next `then` back. Note
        // that we could have used a nested callback here instead of
        // returning a promise and chaining with `then`, but we find
        // this approach cleaner and easier to read and reason about.
        return chai.request(app)
          .put(`/posts/${updateData.id}`)
          .send(updateData);
      })
      // prove that the PUT request has right status code
      .then(function(res) {
        res.should.have.status(204);
      });
  });

  // test strategy:
  //  1. GET a shopping list items so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204
  it('should delete items on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of item
      // to delete
      .get('/posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/posts/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
