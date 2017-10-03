
var blogTemplate = (
  '<li class="js-blog">' +
    '<p><span class="blog js-blog-name"></span></p>' +
    '<div class="blog-controls">' +
      '<button class="js-blog-toggle">' +
        '<span class="button-label">check</span>' +
      '</button>' +
      '<button class="js-blog-delete">' +
        '<span class="button-label">delete</span>' +
      '</button>' +
    '</div>' +
  '</li>'
);

var serverBase = '/';
var BLOG_URL = serverBase + 'blog-posts';


function getAndDisplayBlogPosts() {
  console.log('Retrieving blog posts');
  $.getJSON(BLOG_URL, function(items) {
    console.log('Rendering blog posts');
    var itemElements = items.map(function(item) {
      var element = $(blogTemplate);
      element.attr('id', item.id);
      var itemName = element.find('.js-blog-name')
      itemName.text(item.name);
      element.attr('data-checked', item.checked);
      if (item.checked) {
        itemName.addClass('blog__checked');
      }
      return element
    });
    $('.js-blog').html(itemElements);
  });
}

function addBlogPostItem(item) {
  console.log('Adding blog post: ' + item);
  $.ajax({
    method: 'POST',
    url: BLOG_URL,
    data: JSON.stringify(item),
    success: function(data) {
      getAndDisplayBlogPosts();
    },
    dataType: 'json',
    contentType: 'application/json'
  });
}

function deleteBlogPostItem(itemId) {
  console.log('Deleting blog post item `' + itemId + '`');
  $.ajax({
    url: BLOG_URL + '/' + itemId,
    method: 'DELETE',
    success: getAndDisplayBlogPosts
  });
}

function updateBlogPostItem(item) {
  console.log('Updating blog post item `' + item.id + '`');
  $.ajax({
    url: BLOG_URL + '/' + item.id,
    method: 'PUT',
    data: JSON.stringify(item),
    success: function(data) {
      getAndDisplayBlogPosts()
    },
    dataType: 'json',
    contentType: 'application/json'
  });
}

function handleBlogPostsAdd() {

  $('#js-shopping-list-form').submit(function(e) {
    e.preventDefault();
    addBlogPostItem({
      name: $(e.currentTarget).find('#js-new-item').val(),
      checked: false
    });
  });

}


function handleBlogPostsDelete() {
  $('.js-blog').on('click', '.js-blog-delete', function(e) {
    e.preventDefault();
    deleteBlogPostItem(
      $(e.currentTarget).closest('.js-blog').attr('id'));
  });
}


$(function() {
  getAndDisplayBlogPosts();
  handleBlogPostsAdd();
  handleBlogPostsDelete();
});
