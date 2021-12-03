<script>
  let bnom = "";
  let btype = "";
  let bdesc = "";
  let snom = "";
  let sdate = "";
  let smoyen = "";
  let sdesc = "";
  let bnom = "";
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
   <input type="text" bind:value={bnom} />
   <input type="text" bind:value={btype} />
   <textarea bind:value={bdesc}></textarea>
   <input type="submit" value="Valider"/>
</form>

<form on:submit={e=>send(e,"sauvetage")}>
    <p>Ajouter Bateau</p>
   <input type="text" bind:value={snom} />
   <input type="text" bind:value={sdate} />
   <input type="text" bind:value={smoyen} />
   <textarea bind:value={sdesc}></textarea>
   <input type="submit" value="Valider"/>
</form>


<form on:submit={e=>send(e,"personne")}>
    <p>Ajouter Bateau</p>
   <input type="text" bind:value={pnom} />
   <input type="text" bind:value={pprenom} />
   <input type="text" bind:value={pdate} />
   <textarea bind:value={pdesc}></textarea>
   <input type="submit" value="Valider"/>
</form>
