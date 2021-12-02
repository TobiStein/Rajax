<script>
  import ArticleDisplay from '../elements/Article.svelte';
  import { onMount } from 'svelte';
  let content = "chargement...";

  export let artType;
  export let artId;


  onMount(()=>{
    fetch(`/api/query/${artType}/${artId}`, {method:"GET"}).then(function(res){
      res.json().then((json)=>{
        content = json.Description;
      });
    }).catch(console.log);

  });

</script>

<div>
  <article>
    <ArticleDisplay text={content}/>
  <article>
</div>
