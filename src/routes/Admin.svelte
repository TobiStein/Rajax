<script>
  import { onMount } from 'svelte';

  let reqdata;
  let req2ta;

  fetch("/api/admin/all",{method:"GET",
  credentials: "same-origin"}).then((req)=>{
    console.log(req);
    req.json().then(json=>{
      console.log(json);
      reqdata = json;
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
      <div class="result">
        <a href={`/article/${typingDat(dat.type)}/${dat.id}`}>{dat.Nom}</a>
        <p>{dat.Description}</p>
        <div>
          <button on:click={(e) => approve(e,`${typingDat(dat.type)}/${dat.id}`)} >Approuver</button>
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
</style>
