var express = require('express');
var router = express.Router();
let methods = require('../logic/methods.js');

methods = new methods();

router.get('/',(req, res, next)=> {
    methods.getData(req,res);
});

router.post('/update',(req, res, next)=> {
    methods.updateData(req,res);
});

router.post('/auth', (req, res, next)=> {
    methods.auth(req,res);
});

module.exports = router;
