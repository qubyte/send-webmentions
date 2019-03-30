'use strict';

const sqlite = require('sqlite');
const uuid = require('uuid');
const ready = sqlite.open('.data/database').then(() => sqlite.migrate());

exports.getPosts = function getPosts() {
  return sqlite.all('SELECT * FROM posts');
};

exports.getPost = function getPosts(id) {
  return sqlite.all('SELECT * FROM posts WHERE id = ?', id);
};

exports.createPost = async function createPost(url, createdAt, updatedAt, etag) {
  const id = uuid.v4();
  const query = 'INSERT INTO posts (id, url, createdAt, updatedAt, etag) VALUES (?, ?, ?, ?, ?)';
  
  await sqlite.run(query, id, url, createdAt, updatedAt, etag);
  
  return { id, url, createdAt, updatedAt, etag };
};

exports.updatePost = async function updatePost(id, updatedAt, etag) {
  const query = 'UPDATE posts SET updatedAt = ?, etag = ? WHERE id = ?';
  
  await sqlite.run(query, updatedAt, etag, id);
  
  return await exports.getPost(id);
};

exports.setMention = async function setMention(postId, target) {
  const id = uuid.v4();
  const query = 'INSERT INTO mentions (id, postId, target, createdAt) VALUES (?, ?, ?, ?)';

  await sqlite.run(query, id, postId, target, Date.now());
  
  return { id, postId, target };
};

exports.getMentionsForPost = async function getMentionsForPost(postId) {
  const query = 'SELECT * FROM mentions WHERE postId = ?';
  
  return await sqlite.all(query, postId);
};

ready.then(
  () => console.log('sqlite ready.'),
  error => console.error('Error getting sqlite ready.', error)
);

exports.ready = ready;
