<script>
  import { onMount } from 'svelte';

  let reqdata;

  fetch("/api/admin/all",{method:"GET"}).then(console.log);


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
