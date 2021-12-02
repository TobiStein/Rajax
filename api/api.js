const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');


/*BODY PARSER*/
router.use(bodyParser.json());

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
