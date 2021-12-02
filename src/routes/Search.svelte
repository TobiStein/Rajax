<script>
  import { onMount } from 'svelte';

  export const query = "";
  export const filters = "0";

  let reqdata = [];

  function send(e){
    let f = parseInt(filters);
    const filter_all = ["SAUVE", "SAUVETEUR","SAUVETAGE","BATEAU"];
    let filter_tab = [];
    let i;
    for (i of filter_all){
      if (f%2 != 1) filter_tab.push(i)
      f = (f-f%2)/2;
    }

    let data = {types:filter_tab, search : query};
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
      });
    });
  }

  onMount(send);

</script>

<div>
  {#each reqdata as dat}
    <div>
      <h1>{dat.title}</h1>
      <p>{dat.desc}</p>
    </div>
  {/each}
</div>
