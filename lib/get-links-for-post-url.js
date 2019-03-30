'use strict';

const { URL } = require('url');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { denyList, baseUrl } = require('../package');

const denyRegexps = denyList.map(pattern => new RegExp(pattern));

function isValid(url) {
  if (url.startsWith(baseUrl)) {
    return false;
  }
  
  if (!url.startsWith('http')) {
    return false;
  }

  for (const regexp of denyRegexps) {
    if (regexp.test(url)) {
      return false;
    }
  }

  return true;
}

module.exports = async function getUrlsInPost(post, mentions) {
  const newLinks = [];
  const postRes = await fetch(post.url);

  if (!postRes.ok) {
    console.error('Unexpected response.', { url: post.url, status: postRes.status });
    return { updates: false, newLinks };
  }

  const updatedEtag = postRes.headers.get('etag');

  if (updatedEtag && updatedEtag === post.etag) {
    console.log('ETag for url unchanged.', { url: post.url, etag: post.etag });
    return { updates: false, newLinks, etag: post.etag };
  }

  // We need to download and parse the page to search for a dt-updated.
  const text = await postRes.text();
  const $ = cheerio.load(text);

  const datetimeCreated = $('.dt-published').attr('datetime');
  const datetimeUpdated = $('.dt-updated').attr('datetime');

  console.log({ created: datetimeCreated, updated: datetimeUpdated });

  const createdAt = new Date(datetimeCreated || Date.now()).getTime();
  const updatedAt = new Date(datetimeUpdated || createdAt).getTime();

  if (post.updatedAt === updatedAt) {
    console.log('Body of post not updated.', { url: post.url, updatedAt });
    return { updates: false, newLinks, etag: updatedEtag };
  }

  const mentionedUrls = mentions.map(mention => mention.url);
  
  let i = 0;

  // Build a list of new, unique URLs (which don't correspond to webmentions).
  $('a:not(.webmention)').each(function () {
    const url = $(this).attr('href');
  
    if (url) {
      const full = new URL(url, baseUrl).href

      if (!mentionedUrls.includes(full) && !newLinks.includes(full) && isValid(full)) {
        newLinks.push(full);
      }
    }
  });

  return { updates: true, newLinks, createdAt, updatedAt, etag: post.etag };
};