<script>
  import ArticleDisplay from '../elements/Article.svelte';
  import Bateaux from '../elements/Bateaux.svelte';
  import Personnes from '../elements/Personnes.svelte';
  import Sauvetage from '../elements/Sauvetage.svelte';
  import { onMount } from 'svelte';

  let content = "chargement...";
  let nom = "chargement...";
  let prenom = "chargement...";
  let date = "chargement...";
  let modele = "chargement...";
  let personnes = "chargement...";
  let pesonnes = "chargement...";
  let moyen = "chargement...";
  let annee = "chargement...";
  let date_s = "chargement...";

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
        console.log(json);
        content = json.Description;
        nom = json.Nom;
        date = json.date_naissance;
        date_s = json.Date;
        pesonnes = json.pesonnes;
        personnes = json.implication;
        modele = json.Type;
        moyen = json.moyen_tech;
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
    <ArticleDisplay type={artType} text={content}>
      {#if artType=="personne"}
        <Personnes nom={nom} date={date} />
      {:else if artType=="sauvetage"}
        <Sauvetage personnes={pesonnes} date={date_s == null?"Inconnu":date_s} moyen={moyen == null?"Inconnu":moyen} />
      {:else if artType=="bateau"}
        <Bateaux nom={nom} modele={modele} annee={date_s} />
      {/if}
    </ArticleDisplay>
  </article>
  {/if}
</div>
