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
