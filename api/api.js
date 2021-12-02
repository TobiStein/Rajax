const express = require('express');
const router = express.Router();
const search = require('./search.js');
const log = require('./log.js');
const bodyParser = require('body-parser');


/*BODY PARSER*/
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

router.use(log)
router.use(search)

/*HEADER*/
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

router.use((req, res, next) => {
  res.status(200).json({message: "Hello World"});
});

module.exports = router;
