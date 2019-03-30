'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const dispatchMentions = require('./lib/dispatch-mentions');
const db = require('./lib/db');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.post('/webhook', async (req, res) => {
  console.log('/webhook received request.', req.body, req.headers);

  // No need to hold up the webhook response.
  res.sendStatus(202);

  try {
    await dispatchMentions();
  } catch (error) {
    console.error('Error dispatching mentions.', error);
  }
});

db.ready.then(() => {
  app.listen(process.env.PORT, function () {
    console.log(`Listening on port ${process.env.PORT}.`);
  });  
});
