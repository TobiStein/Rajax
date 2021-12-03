const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('./bdd.db', (err) => {
    if (err) {
        return console.error(err.message);
    }

    console.log("Connecté à la db")

});

router.get("/admin/all/", (req, res) =>{
    let resp = [];
    db.all("SELECT * FROM BATEAU ", [], (err, rows) => {
        if (err) { throw err; }

        rows.forEach((elt) => {
            elt.type = "BATEAU";
        });
        resp = resp.concat(rows);
        

        db.all("SELECT * FROM PERSONNE ", [], (err, rows) => {
            if (err) { throw err; }
            rows.forEach((elt) => {
                elt.type = "PERSONNE";
            });
            resp = resp.concat(rows);

            db.all("SELECT * FROM EVENT ", [], (err, rows) => {
                if (err) { throw err; }
                
                rows.forEach((elt) => {
                    elt.type = "SAUVETAGE";
                });
                resp = resp.concat(rows);
                res.status(200).json(resp);
            });
        });

    });
})

router.post("/search", (req, res) => {
    let resp = [];
    //console.log(req.body);
    req.body.search = req.body.search.toLowerCase();  
    let data = {
        types : req.body.types,
        search : [req.body.search].concat(req.body.search.split(' '))
    };

    let next = (resp, index_element, data) => {
        let element = data.types;
        var SQL = undefined
        if (element[index_element] == "BATEAU"){
            var actual_type = "BATEAU";
            var SQL = "SELECT id, Nom as title, Description as desc FROM BATEAU WHERE waiting_valid = 0 AND ("
        } else if (element[index_element] == "SAUVE"){
            var actual_type = "PERSONNE";
            var SQL = "SELECT PERSONNE.id, Nom as title, Prenom, Description as desc FROM PERSONNE, PERSONNE_ROLE WHERE PERSONNE_ROLE.id_pers = PERSONNE.id AND PERSONNE_ROLE.role = 'SAUVE' AND waiting_valid = 0 AND ("
        } else if (element[index_element] == "SAUVETEUR"){
            var actual_type = "PERSONNE";
            var SQL = "SELECT PERSONNE.id, Nom as title, Prenom, Description as desc FROM PERSONNE, PERSONNE_ROLE WHERE PERSONNE_ROLE.id_pers = PERSONNE.id AND PERSONNE_ROLE.role = 'SAUVETEUR' AND waiting_valid = 0 AND ("
        } else if (element[index_element] == "SAUVETAGE"){
            var actual_type = "SAUVETAGE";
            var SQL = "SELECT id, Nom as title, Description as desc FROM EVENT WHERE waiting_valid = 0 AND ("
        }
        if (SQL){

            for (var i=0; i<data.search.length; i++){
                if (element[index_element] == "SAUVE" || element[index_element] == "SAUVETEUR"){
                    SQL += "lower(Nom || Prenom || Description) LIKE '%' || ? || '%' OR "
                } else {
                    SQL += "lower(Nom || Description) LIKE '%' || ? || '%' OR "
                }
                
            }

            SQL = SQL.substring(0, SQL.length - 3);
            SQL += ")";

            db.all(SQL, data.search, (err, rows) => {
                if (err){
                    console.log("err", SQL);
                    throw err;
                }

                let query = [];
                rows.forEach((elt) =>{
                    if (elt.Prenom){
                        elt.title = elt.title + " " + elt.Prenom;
                        delete elt.Prenom;
                    }
                    elt.type = element[index_element];
                    elt.actual_type = actual_type;
                    
                    let pass = true;
                    for (var i = 0; i<resp.length && pass; i++){  // Eliminer les doublons
                        if (resp[i].id === elt.id && resp[i].actual_type === elt.actual_type){
                            pass = false;
                        }
                    }
                    if (pass){
                        resp.push(elt)
                    }

                });

                index_element++;
                next(resp, index_element, data);
            });
        } else {
            res.status(200).json(resp);
            //console.log(resp);
        }

    }

    next(resp, 0, data)

    //console.log(resp);
    //res.send("Bonjour");
});

router.post("/add/:type/", (req, res) => {
    console.log("ok");
    if (req.params.type == "bateau"){
        let data = {
            nom : req.body.nom,
            description : req.body.desc,
            type : req.body.type,
        }

        db.run("INSERT INTO BATEAU (Nom, Description, Type, waiting_valid) VALUES (?, ?, ?, ?)", [data.nom, data.description, data.type, 1], (err) => {
            if (err) { throw err }
            res.status(200).send("ok");
        })
    } else if (req.params.type == "sauvetage"){
        let data = {
            nom : req.body.nom,
            description : req.body.desc,
            moyen_tech : req.body.moyen_tech,
            date : req.body.date
        }

        db.run("INSERT INTO EVENT (Nom, Description, moyen_tech, Date, Add_Date, waiting_valid) VALUES (?, ?, ?, ?, ?, ?)", [data.nom, data.description, data.moyen_tech, data.date, Date.now(), 1], (err) => {
            if (err) { throw err }
            console.log("ok");
            res.status(200).send("ok");
        })

    } else if (req.params.type == "personne"){
        let data = {
            nom : req.body.nom,
            nom : req.body.prenom,
            description : req.body.desc,
            naissance : req.body.date_naissance,
        }

        db.run("INSERT INTO PERSONNE (Nom, Prenom, Description, Date_naissance, waiting_valid) VALUES (?, ?, ?, ?, ?)", [data.nom, data.prenom, data.description, data.naissance, 1], (err) => {
            if (err) { throw err }
            console.log("ok");
            res.status(200).send("ok");
        });
    } else {
        res.status(404).send("404")
    };
});

router.get("/query/*/*", (req, res) => {
    let url_parse = req.url.split("/");
    let type_available = ["bateau", "personne", "sauvetage"];
    var type = url_parse[url_parse.length - 2];
    var id = parseInt(url_parse[url_parse.length - 1]);

    if (Number.isInteger(id) && type_available.includes(type)){
        var SQL = "SELECT * FROM";
        if (type == "bateau"){
            SQL += " BATEAU ";
        } else if (type == "sauvetage"){
            SQL += " EVENT ";
        } else if (type == "personne"){
            SQL += " PERSONNE ";
        }
        SQL += "WHERE id = ?";

        db.get(SQL, [id], (err, row) => {
            if (err) {
                throw err;
            }
            if (row){
                if (type == "sauvetage"){
                    db.all("SELECT PERSONNE.Nom || ' ' || Personne.Prenom as nom, PERSONNE_ROLE.id_pers as id, PERSONNE_ROLE.role FROM EVENT, PERSONNE_ROLE, PERSONNE WHERE EVENT.id = PERSONNE_ROLE.id_event and PERSONNE_ROLE.id_pers = PERSONNE.id and EVENT.id = " + row.id, [], (err, rows) => {
                        if (err) { throw err; }
                        row.pesonnes = rows;
                        db.all("SELECT BATEAU.Nom as nom, BATEAU_ROLE.id_bateau as id, BATEAU_ROLE.role FROM EVENT, BATEAU_ROLE, BATEAU WHERE EVENT.id = BATEAU_ROLE.id_event and BATEAU.id = BATEAU_ROLE.id_bateau and EVENT.id = " + row.id, [], (err, rows) => {
                            if (err) { throw err; }
                            row.bateaux = rows
                            res.status(200).json(row);
                        })
                    });
                } else if (type == "personne"){
                    db.all("SELECT PERSONNE_ROLE.id_event as id, PERSONNE_ROLE.role FROM PERSONNE, PERSONNE_ROLE WHERE PERSONNE.id = PERSONNE_ROLE.id_pers AND PERSONNE.id = " + row.id, [], (err, rows) => {
                        if (err) { throw err; };
                        row.implication = rows;
                        res.status(200).json(row);
                    });
                } else if (type = "bateau"){
                    db.all("SELECT BATEAU_ROLE.id_event as id, BATEAU_ROLE.role FROM BATEAU, BATEAU_ROLE WHERE BATEAU.id = BATEAU_ROLE.id_bateau AND BATEAU.id = " + row.id, [], (err, rows) => {
                        if (err) { throw err; };
                        row.implication = rows;
                        res.status(200).json(row);
                    });
                }
                
            } else {
                res.status(404).send("404");
            }

        })
    } else {
        res.status(404).send("404");
    }

});

router.get("/admin/accept/:type/:id", (req, res) => {
    let data = {
        type : req.params.type,
        id : parseInt(req.params.id)}
    
    if (data.type == "bateau"){
        db.run("UPDATE BATEAU SET waiting_valid = 0 WHERE id = ?", [data.id], (err) => {
            if (err) { throw err }
            res.status(200).send("ok");
        })
    } else if (data.type == "sauvetage"){
        db.run("UPDATE EVENT SET waiting_valid = 0 WHERE id = ?", [data.id], (err) => {
            if (err) { throw err }
            res.status(200).send("ok");
        })
    } else if (data.type == "personne"){
        db.run("UPDATE PERSONNE SET waiting_valid = 0 WHERE id = ?", [data.id], (err) => {
            if (err) { throw err }
            res.status(200).send("ok");
        })
    } else {
        res.status(404).send("404");
    }  
});

router.get("/admin/delete/:type/:id", (req, res) => {
    let data = {
        type : req.params.type,
        id : parseInt(req.params.id)}
    
    if (data.type == "bateau"){
        db.run("DELETE FROM BATEAU WHERE id = ?", [data.id], (err) => {
            if (err) { throw err }
            res.status(200).send("ok");
        })
    } else if (data.type == "sauvetage"){
        db.run("DELETE FROM EVENT WHERE id = ?", [data.id], (err) => {
            if (err) { throw err }
            res.status(200).send("ok");
        })
    } else if (data.type == "personne"){
        db.run("DELETE FROM PERSONNE WHERE id = ?", [data.id], (err) => {
            if (err) { throw err }
            res.status(200).send("ok");
        })
    } else {
        res.status(404).send("404");
    }  
});

module.exports = router;
