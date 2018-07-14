const express = require('express');
const app = express();

app.get('/', function index(req, res) { 
  console.log(req);
  res.send('Hello World!');
});

app.listen(3000);
