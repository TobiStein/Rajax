const express = require('express');
const router = express.Router();

const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('./bdd.db', (err) => {
    if (err) {
        return console.error(err.message);
    }

    console.log("Connecté à la db")

});

router.post("/search", (req, res) => {
    let resp = [];
    let data = {
        types : req.body.types,
        search : [req.body.search].concat(req.body.search.split(' '))
    };

    let next = (resp, index_element, data) => {
        let element = data.types;
        var SQL = undefined
        if (element[index_element] == "BATEAU"){
            var SQL = "SELECT id, Nom as title, Description as desc FROM BATEAU"
        } else if (element[index_element] == "SAUVE"){
            var SQL = "SELECT id, Nom as title, Prenom, Description as desc FROM PERSONNE"
        } else if (element[index_element] == "SAUVETEUR"){
            var SQL = "SELECT id, Nom as title, Prenom, Description as desc FROM PERSONNE"
        } else if (element[index_element] == "SAUVETAGE"){
            var SQL = "SELECT id, Nom as title, Description as desc FROM EVENT"
        }
        if (SQL){
            SQL += " WHERE " 

            for (var i=0; i<data.search.length; i++){
                SQL += "lower(Nom || Description) LIKE '%' || ? || '%' OR "
            }

            SQL = SQL.substring(0, SQL.length - 3);
             
            db.all(SQL, data.search, (err, rows) => {
                if (err){
                    console.log("err", SQL);
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

router.get("/query/*/*", (req, res) => {
    let url_parse = req.url.split("/");
    let type_available = ["bateau", "personne", "sauvetage"];
    var type = url_parse[url_parse.length - 2];
    var id = parseInt(url_parse[url_parse.length - 1]);
    
    if (Number.isInteger(id) && type_available.includes(type)){
        var SQL = "SELECT * FROM";
        if (type == "bateau"){
            SQL += " BATEAU";
        } else if (type == "sauvetage"){
            SQL += " EVENT";
        } else if (type == "personne"){
            SQL += " PERSONNE";
        }
        SQL += " WHERE id = ? AND waiting_valid=0";

        db.get(SQL, [id], (err, row) => {
            if (err) {
                throw err;
            }
            if (row){
                res.status(200).json(row);
            } else {
                res.status(404).send("404");
            }
            
        })
    } else {
        res.status(404).send("404");
    }
    
});

module.exports = router;