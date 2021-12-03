<script>
  let bnom = "";
  let btype = "";
  let bdesc = "";
  let snom = "";
  let sdate = "";
  let smoyen = "";
  let sdesc = "";
  let pnom = "";
  let pprenom = "";
  let pdate = "";
  let pdesc = "";

  function send(e,tp){
    e.preventDefault();
    var body = {};
    if (tp == "bateau"){
      body = {
        nom:bnom,
        desc:bdesc,
        type:btype
      }
    } else if (tp == "sauvetage") {
      body = {
        nom:snom,
        desc:sdesc,
        moyen_tech:smoyen,
        date: sdate
      }
    }else if (tp == personne){
      body = {
        nom: pnom,
        prenom: pprenom,
        desc: pdesc,
        date_naissance:pdate
      }
    }else return alert("Données invalides");

    let option = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
    fetch("/api/add/"+tp, option).then(function(response){
        console.log(response);
        if (response.status == 200) return alert("Envoyé");
        alert("Erreur envoi, données surement invalides");
    }).catch((error)=>{
      alert("Erreur envoi, données surement invalides");
    });
  }
</script>


<form on:submit={e=>send(e,"bateau")}>
    <p>Ajouter Bateau</p>
   <input type="text" bind:value={bnom} alt="Nom" placeholder="Nom" />
   <input type="text" bind:value={btype} alt="Type" placeholder="Type" />
   <textarea bind:value={bdesc}></textarea>
   <input type="submit" value="Valider"/>
</form>

<form on:submit={e=>send(e,"sauvetage")}>
    <p>Ajouter Sauvetage</p>
   <input type="text" bind:value={snom} alt="Nom" placeholder="Nom"/>
   <input type="text" bind:value={sdate} alt="Date" placeholder="Date"/>
   <input type="text" bind:value={smoyen} alt="Moyen Technique" placeholder="Moyen Technique"/>
   <textarea bind:value={sdesc}></textarea>
   <input type="submit" value="Valider"/>
</form>


<form on:submit={e=>send(e,"personne")}>
    <p>Ajouter Personne</p>
   <input type="text" bind:value={pnom} alt="Personne" placeholder="Personne" />
   <input type="text" bind:value={pprenom} alt="Prénom" placeholder="Prénom" />
   <input type="text" bind:value={pdate} alt="Date" placeholder="Date" />
   <textarea bind:value={pdesc}></textarea>
   <input type="submit" value="Valider"/>
</form>
