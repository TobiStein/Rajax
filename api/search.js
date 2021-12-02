const express = require('express');
const router = express.Router();

const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('./bdd.db', (err) => {
    if (err) {
        return console.error(err.message);
    }

    console.log("Connecté à la db")

});

/*let sql = 'SELECT * FROM BATEAU';

db.all(sql, [], (err, rows) => {
    if (err){
        throw err;
    }

    console.log(rows);
});*/

//{types:["test", "bonjou"], search : "la recherche"}
router.post("/search", (req, res) => {
    let resp = [];
    let data = {
        types : req.body.types,
        search : req.body.search
    };
    //console.log(data);

    let next = (resp, index_element, data) => {
        let element = data.types;
        var SQL = undefined
        if (element[index_element] == "BATEAU"){
            var SQL = 'SELECT Nom as title, Description as desc FROM BATEAU'
        } else if (element[index_element] == "SAUVE"){
            var SQL = 'SELECT Nom as title, Prenom, Description as desc  FROM PERSONNE'
        } else if (element[index_element] == "SAUVETEUR"){
            var SQL = 'SELECT Nom as title, Prenom, Description as desc  FROM PERSONNE'    
        } else if (element[index_element] == "SAUVETAGE"){
            var SQL = 'SELECT Nom as title, Description as desc FROM EVENT'
        }
        if (SQL){
            db.all(SQL, [], (err, rows) => {
                if (err){
                    throw err;
                }
                rows.forEach((elt) =>{
                    if (elt.Prenom){
                        elt.title = elt.title + " " + elt.Prenom;
                        delete elt.Prenom;
                    }
                    elt.type = element[index_element];
                });
                
                resp = resp.concat(rows);
                index_element++;
                next(resp, index_element, data);
            });
        } else {
            res.status(200).json(resp);
            console.log(resp);
        }
        
    }

    next(resp, 0, data)

    //console.log(resp);
    //res.send("Bonjour");
});

module.exports = router;