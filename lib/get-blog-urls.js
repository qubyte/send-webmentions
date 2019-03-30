'use strict';

const { URL } = require('url');
const fetch = require('node-fetch');
const { postPattern, baseUrl } = require('../package');
const blogUrlRegexp = new RegExp(postPattern);

module.exports = async function getBlogUrls() {
  const res = await fetch(new URL('/sitemap.txt', baseUrl).href);
  const text = await res.text();
  const urls = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => blogUrlRegexp.test(line));

  return urls;
};
