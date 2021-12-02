<script>
  import {navigate} from 'svelte-routing';
  let query = "";

  let filter = false;
  let sauve = false;
  let sauveteur = false;
  let sauvetage = false;
  let bateau = false;

  function send(e){
    let nb = 1*sauve+2*sauveteur+4*sauvetage+8*bateau;
    navigate("/search/"+encodeURI(query)+"/"+nb.toString())
  }
</script>

<form>
  <input type="texte" alt="Champ de recherche d'une archive" bind:value={query} placeholder="Entrez votre recherche" />
  <input type="button" alt="Valider la recherche" value="🔍" on:click={send} />
  <label for="search_filter_box">Filtrer</label><input alt="Activer pour filtrer la recherche" id="search_filter_box" type="checkbox" />
  <div>
    <input type="checkbox" bind:value={sauve} id="filtre_sauve" alt="Filtre: Inclure les sauvés" /><label for="filtre_sauve" >Personnes sauvées</label>
    <input type="checkbox" bind:value={sauveteur} id="filtre_sauveteur" alt="Filtre: Inclure les sauveteur" /><label for="filtre_sauveteur" >Sauveteur</label>
    <input type="checkbox" bind:value={bateau} id="filtre_bateau" alt="Filtre: Inclure les bateaux" /><label for="filtre_bateau" >Bateau</label>
    <input type="checkbox" bind:value={sauvetage} id="filtre_sauvetage" alt="Filtre: Inclure les sauvetages" /><label for="filtre_sauvetage" >Sauvetage</label>
  </div>
</form>


<style>
  #search_filter_box + div{
    display:none;
  }
  #search_filter_box:checked + div{
    display: block;
  }
</style>
