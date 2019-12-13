var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', (req, res, next)=> {
  req.session.user = '';
  console.log("=================================");
  console.log(req.session.user);
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

router.get('/app', (req, res, next)=> {
    if(!req.session.user)
      res.redirect('/');

    res.sendFile(path.join(__dirname, '../client/index.html'));
});

module.exports = router;
