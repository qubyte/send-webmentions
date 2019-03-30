'use strict';

const db = require('./db');
const getLinksForUrl = require('./get-links-for-post-url')
const getBlogUrls = require('./get-blog-urls');
const { promisify } = require('util');
const sendWebmention = promisify(require('send-webmention'));

async function dispatchMentionsForPost(post, links) {
  await Promise.all(links.map(async link => {
    let success;

    try {
      ({ success } = sendWebmention(post.url, link));
    } catch (e) {
      console.error(`Error sending webmention to ${link}.`, e);
      success = false;
    }

    if (success) {
      console.log(`Dispatched webmention from ${post.url} to receiver for ${link}.`);
      await db.setMention(post.id, link);
    } else {
      console.log(`Failed to dispatch webmention from ${post.url} to receiver for ${link}.`);
    }
  }));
}

module.exports = async function dispatchMentions() {
  const urls = await getBlogUrls();
  const posts = await db.getPosts();
  
  for (const url of urls) {
    const post = posts.find(post => post.url === url) || { url };
    const mentions = post.id ? await db.getMentionsForPost(post.id) : [];
    const { updates, newLinks, createdAt, updatedAt, etag } = await getLinksForUrl(post, mentions);
    
    let updatedPost;
    
    if (!post.id) {
      updatedPost = await db.createPost(url, createdAt, updatedAt, etag);
    } else if (post.etag !== etag || post.updatedAt !== post.updatedAt) {
      updatedPost = await db.updatePost(post.id, etag, updatedAt);
    } else {
      updatedPost = { ...post };
    }
    
    await dispatchMentionsForPost(updatedPost, newLinks)
  }
  
  console.log('All done.');
};
