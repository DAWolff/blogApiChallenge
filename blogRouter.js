const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPosts} = require('./models');

// we're going to add some blogs to Blog
// so there's some data to look at
//    title, content, author, [publishDate]

BlogPosts.create(
  'Winnie the Pooh', 'Winnie the Pooh in modern literature is a facinating topic. Lorem ipsum dolor sit amet, ei sea labore putant epicurei, albucius convenire nam in. Te vim insolens scriptorem necessitatibus, no vim purto mutat falli, diceret accommodare et vel. Pri ea dicam incorrupte. Pri at vocent audire, dolor oportere abhorreant mel ea. Te his duis aeque doctus.', 'Bob Robertson');
BlogPosts.create(
  'Calvin and Hobbes', 'The relationship between Calvin and Hobbes is a facinating subject (not).  Ad vitae iuvaret nam, vix eu tale dicit quidam. Eum modus fabulas legendos ex, no regione delectus expetendis est, ne pri summo lobortis erroribus. Quis zril timeam eum et, sed everti pertinacia reformidans ea. Sit ut liber dicam conceptam, ut eruditi copiosae eam.', 'Gregon McGregor');

// send back JSON representation of all blogs
// on GET requests to root
router.get('/', (req, res) => {
  res.json(BlogPosts.get());
});


// when new blog added, ensure has required fields. if not,
// log error and return 400 status code with hepful message.
// if okay, add new item, and return it with a status 201.
router.post('/', jsonParser, (req, res) => {
  // ensure `title`, `content` and `author` are in request body
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = BlogPosts.create(req.body.title, req.body.content, req.body.author);
  res.status(201).json(item);
});

// Delete blogs (by id)!
router.delete('/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post \`${req.params.ID}\``);
  res.status(204).end();
});

// when PUT request comes in with updated blog post, ensure has
// required fields. also ensure that blog id in url path, and
// blog id in updated item object match. if problems with any
// of that, log error and send back status code 400. otherwise
// call `BlogPosts.updateItem` with updated blog post.
router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating shopping list item \`${req.params.id}\``);
  BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  });
  res.status(204).end();
})

module.exports = router;
