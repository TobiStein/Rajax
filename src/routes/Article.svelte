<script>
  import ArticleDisplay from '../elements/Article.svelte';
  import { onMount } from 'svelte';
  let content = "chargement...";

  let gotError = false;

  export let artType;
  export let artId;


  onMount(()=>{
    fetch(`/api/query/${artType}/${artId}`, {method:"GET"}).then(function(res){
      if (res.status!= 200){
        gotError = true;
        return;
      }
      res.json().then((json)=>{
        content = json.Description;
      }).catch((error) => {
        gotError = true;
      });
    }).catch((error) => {
      gotError = true;
    });
  });

</script>

<div>
  {#if gotError}
  <div>
    <p>Erreur 404: Article non trouvé</p>
  </div>
  {:else}
  <article>
    <ArticleDisplay text={content}/>
  </article>
  {/if}
</div>
