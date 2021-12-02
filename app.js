const express = require('express')
const app = express()
const svelte = require("./public/App.js")
const apiRoute = require('./api/api.js');

app.use('/api', apiRoute);

app.use(express.static(__dirname+"/public"));

app.use("*", function(req, res) {
  const { html } = svelte.render({ url: req.url });

  res.write(`
    <!DOCTYPE html>
    <link rel='stylesheet' href='/global.css'>
    <link rel='stylesheet' href='/bundle.css'>
    <div id="app">${html}</div>
    <script src="/bundle.js"></script>
  `);

  res.end();
});


module.exports =  app;
