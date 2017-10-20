const uuid = require('uuid');

// This module provides volatile storage, using a `BlogPost`
// model. We haven't learned about databases yet, so for now
// we're using in-memory storage. This means each time the app stops, our storage
// gets erased.

// Don't worry too much about how BlogPost is implemented.
// Our concern in this example is with how the API layer
// is implemented, and getting it to use an existing model.


function StorageException(message) {
   this.message = message;
   this.name = "StorageException";
}

const BlogPosts = {
  create: function(title, content, author, publishDate) {
    console.log('Creating a new blog post');
    const post = {
      id: uuid.v4(),
      title: title,
      content: content,
      author: author,
      publishDate: publishDate || Date.now()
    };
    this.items.push(post);
    return post;
  },
  get: function(id=null) {
    // if id passed in, retrieve single post,
    // otherwise send all posts.
    if (id !== null) {
      return this.items.find(post => post.id === id);
    }
    // return posts sorted (descending) by
    // publish date
    return this.items.sort(function(a, b) {
      return b.publishDate - a.publishDate
    });
  },
  delete: function(id) {
    const postIndex = this.items.findIndex(
      post => post.id === id);
    if (postIndex > -1) {
      this.items.splice(postIndex, 1);
    }
  },
  update: function(updatedPost) {
    const {id} = updatedPost;
    const postIndex = this.items.findIndex(
      post => post.id === updatedPost.id);
    if (postIndex === -1) {
      throw new StorageException(
        `Can't update item \`${id}\` because doesn't exist.`)
    }
    this.items[postIndex] = Object.assign(
      this.items[postIndex], updatedPost);
    return this.items[postIndex];
  }
};

function createBlogPostsModel() {
  const storage = Object.create(BlogPosts);
  storage.items = [];
  return storage;
}


module.exports = {BlogPosts: createBlogPostsModel()};
