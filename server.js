
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const {PORT, DATABASE_URL} = require('./config');
const {Blog} = require('./models');
// const blogRouter = require('./blogRouter');
const router = express.Router();

const app = express();

mongoose.Promise = global.Promise;

// log the http layer
app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// GET requests to /posts => return 10 most recent blogs
app.get('/posts', (req, res) => {
  Blog
    .find()
    .limit(10)
    // success callback: for each blog we got back, we'll
    // call the `.apiRepr` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(blogs => {
      res.json({
        blogs: blogs.map(
          (blog) => blog.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

// can also request by ID
app.get('/posts/:id', (req, res) => {
  Blog
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .then(blog =>res.json(blog.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});


app.post('/posts', (req, res) => {
  // req.body> "title": "some title",
  //           "content": "a bunch of amazing words",
  //           "author": {
  //           "firstName": "Sarah",
  //           "lastName": "Clarke" }
  const requiredFields = ['title', 'content', 'author.firstName', 'author.lastName'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Blog
    .create({
      title: req.body.title,
      content: req.body.content,
      firstName: req.body.author.firstName,
      lastName: req.body.author.lastName})
    .then(
      blog => res.status(201).json(blog.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});


app.put('/posts/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({message: message});
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ['title', 'content', 'firstName', 'lastName'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Blog
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(blog => res.status(200).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/posts/:id', (req, res) => {
  Blog
    .findByIdAndRemove(req.params.id)
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});


// both runServer and closeServer need to access the same
// server object, so we declare `server` here, and then when
// runServer runs, it assigns a value.
let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};

// this code from blogRouter:

// BlogPosts.create(
//   'Winnie the Pooh', 'Winnie the Pooh in modern literature is a facinating topic. Lorem ipsum dolor sit amet, ei sea labore putant epicurei, albucius convenire nam in. Te vim insolens scriptorem necessitatibus, no vim purto mutat falli, diceret accommodare et vel. Pri ea dicam incorrupte. Pri at vocent audire, dolor oportere abhorreant mel ea. Te his duis aeque doctus.', 'Bob Robertson');
// BlogPosts.create(
//   'Calvin and Hobbes', 'The relationship between Calvin and Hobbes is a facinating subject (not).  Ad vitae iuvaret nam, vix eu tale dicit quidam. Eum modus fabulas legendos ex, no regione delectus expetendis est, ne pri summo lobortis erroribus. Quis zril timeam eum et, sed everti pertinacia reformidans ea. Sit ut liber dicam conceptam, ut eruditi copiosae eam.', 'Gregon McGregor');
//
// // send back JSON representation of all blogs
// // on GET requests to root
// router.get('/', (req, res) => {
//   res.json(BlogPosts.get());
// });
//
//
// // when new blog added, ensure has required fields. if not,
// // log error and return 400 status code with hepful message.
// // if okay, add new item, and return it with a status 201.
// router.post('/', jsonParser, (req, res) => {
//   // ensure `title`, `content` and `author` are in request body
//   const requiredFields = ['title', 'content', 'author'];
//   for (let i=0; i<requiredFields.length; i++) {
//     const field = requiredFields[i];
//     if (!(field in req.body)) {
//       const message = `Missing \`${field}\` in request body`
//       console.error(message);
//       return res.status(400).send(message);
//     }
//   }
//   const item = BlogPosts.create(req.body.title, req.body.content, req.body.author);
//   res.status(201).json(item);
// });
//
// // Delete blogs (by id)!
// router.delete('/:id', (req, res) => {
//   BlogPosts.delete(req.params.id);
//   console.log(`Deleted blog post \`${req.params.ID}\``);
//   res.status(204).end();
// });
//
// // when PUT request comes in with updated blog post, ensure has
// // required fields. also ensure that blog id in url path, and
// // blog id in updated item object match. if problems with any
// // of that, log error and send back status code 400. otherwise
// // call `BlogPosts.updateItem` with updated blog post.
// router.put('/:id', jsonParser, (req, res) => {
//   const requiredFields = ['title', 'content', 'author'];
//   for (let i=0; i<requiredFields.length; i++) {
//     const field = requiredFields[i];
//     if (!(field in req.body)) {
//       const message = `Missing \`${field}\` in request body`
//       console.error(message);
//       return res.status(400).send(message);
//     }
//   }
//   if (req.params.id !== req.body.id) {
//     const message = (
//       `Request path id (${req.params.id}) and request body id `
//       `(${req.body.id}) must match`);
//     console.error(message);
//     return res.status(400).send(message);
//   }
//   console.log(`Updating blog post item \`${req.params.id}\``);
//   BlogPosts.update({
//     id: req.params.id,
//     title: req.body.title,
//     content: req.body.content,
//     author: req.body.author
//   });
//   res.status(204).end();
// })
