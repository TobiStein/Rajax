<script>

  let reqdata;


  fetch("/api/admin/all",{method:"GET",
  credentials: "same-origin"}).then((req)=>{
    console.log(req);
    req.json().then(json=>{
      console.log(json);
      reqdata = json.sort((a,b)=>{
        return a.waiting_valid<b.waiting_valid?1:-1;
      });
    });
  });

  function approve(e,pat){
    e.preventDefault();
    fetch("/api/admin/accept/"+pat,{method:"GET",
    credentials: "same-origin"}).then((req)=>{
      console.log(req);
      if (req.status == 200) location.reload();
    });
  }

  function remove(e,pat){
    e.preventDefault();
    fetch("/api/admin/delete/"+pat,{method:"GET",
    credentials: "same-origin"}).then((req)=>{
      console.log(req);
      if (req.status == 200) location.reload();
    });
  }


  function typingDat(tp){
    if (tp == "SAUVE" || tp == "SAUVETEUR") return "personne";
    return tp.toLowerCase();
  }

</script>

<div>
  {#if reqdata != null}
    {#each reqdata as dat}
      <div class={"result"+(dat.waiting_valid == 1?"":" accepted")}>
        <a href={`/article/${typingDat(dat.type)}/${dat.id}`}>{dat.Nom}</a>
        <p>{dat.Description}</p>
        <div>
          {#if dat.waiting_valid}
          <button on:click={(e) => approve(e,`${typingDat(dat.type)}/${dat.id}`)} >Approuver</button>
          {/if}
          <button on:click={(e) => remove(e,`${typingDat(dat.type)}/${dat.id}`)}>Supprimer</button>
        </div>
      </div>
    {/each}
  {:else}
    <p>Recherche impossible</p>
  {/if}
</div>

<style>
  .result{
    border: 0.5em solid #888;
    padding:0.5em;
    margin:0.5em;
  }

  .result > a{
    font-size: 2em;
  }

  .accepted{
    border-color: #0f0;
  }
</style>
