const express = require('express');
const router = express.Router();

var cookieParser = require('cookie-parser');
var session = require('express-session');


const user = {
    id : "Admin",
    pswd : "Bonjour"
}

router.use(cookieParser());
router.use(session({secret: "hahahaha, c'est un secret"}));

router.use("/admin/", (req, res, next) => {
    if (req.session.log){
        next();
    } else {
        console.log(req.body);
        if (req.body.log_id == user.id && req.body.log_pswd == user.pswd){
            req.session.log = true;
            next();
        } else {
            res.status(403).send("Interdit");
        }
    }


})

module.exports = router;