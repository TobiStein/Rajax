<script>
  import { onMount } from 'svelte';

  export const query = "";
  export let filters = "0";

  let reqdata = [];

  function send(e){
    let f = parseInt(filters);
    const filter_all = ["SAUVE", "SAUVETEUR","SAUVETAGE","BATEAU"];
    let filter_tab = [];
    let i;
    for (i of filter_all){
      if (filters == "0" || f%2 == 1) filter_tab.push(i);
      f = (f-f%2)/2;
    }

    let data = {types:filter_tab, search : query};

    console.log(data);

    let option = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
           'Content-Type': 'application/json'
        },
           body: JSON.stringify(data)
    };
    fetch("/api/search", option).then(function(res){
      res.json().then((json)=>{
        reqdata = json;
      }).catch((error)=>{
        reqdata = null;
      });
    }).catch((error)=>{
      reqdata = null;
    });
  }

  function typingDat(tp){
    if (tp == "SAUVE" || tp == "SAUVETEUR") return "personne";
    return tp.toLowerCase();
  }

  onMount(send);

</script>

<div>
  {#if reqdata != null}
    {#each reqdata as dat}
      <div class="result">
        <a href={`/article/${typingDat(dat.type)}/${dat.id}`}>{dat.title}</a>
        <p>{dat.desc}</p>
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
