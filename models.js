const mongoose = require('mongoose');

// this is our schema to represent a Blog Post
const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
      firstName: {type: String, required: true},
      lastName: {type: String, required: true}
  },
  publishDate: {type: Date}
});

blogPostSchema.virtual('author').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()});

blogPostSchema.virtual('created').get(function() {
  // let date = ${this.publishDate};
  // date = date.getMonth()+1 + "/" + date.getDate() + "/" + date.getYear();
  // return date;
  return `${this.publishDate}`});

blogPostSchema.methods.apiRepr = function() {
  return {
    title: this.title,
    content: this.content,
    author: this.author,
    created: this.created
  };
}

const Blog = mongoose.model('Blog', blogPostSchema);

module.exports = {Blog};

// function StorageException(message) {
//    this.message = message;
//    this.name = "StorageException";
// }

// const BlogPosts = {
//   create: function(title, content, author, publishDate) {
//     console.log('Creating a new blog post');
//     const post = {
//       id: uuid.v4(),
//       title: title,
//       content: content,
//       author: author,
//       publishDate: publishDate || Date.now()
//     };
//     this.items.push(post);
//     return post;
//   },
//   get: function(id=null) {
//     // if id passed in, retrieve single post,
//     // otherwise send all posts.
//     if (id !== null) {
//       return this.items.find(post => post.id === id);
//     }
//     // return posts sorted (descending) by
//     // publish date
//     return this.items.sort(function(a, b) {
//       return b.publishDate - a.publishDate
//     });
//   },
//   delete: function(id) {
//     const postIndex = this.items.findIndex(
//       post => post.id === id);
//     if (postIndex > -1) {
//       this.items.splice(postIndex, 1);
//     }
//   },
//   update: function(updatedPost) {
//     const {id} = updatedPost;
//     const postIndex = this.items.findIndex(
//       post => post.id === updatedPost.id);
//     if (postIndex === -1) {
//       throw new StorageException(
//         `Can't update item \`${id}\` because doesn't exist.`)
//     }
//     this.items[postIndex] = Object.assign(
//       this.items[postIndex], updatedPost);
//     return this.items[postIndex];
//   }
// };
//
// function createBlogPostsModel() {
//   const storage = Object.create(BlogPosts);
//   storage.items = [];
//   return storage;
// }
// module.exports = {BlogPosts: createBlogPostsModel()};
