<script>
  import {navigate} from 'svelte-routing';
  let query = "";

  let filter = false;
  let sauve = false;
  let sauveteur = false;
  let sauvetage = false;
  let bateau = false;

  function send(e){
    e.preventDefault();
    let nb = 0;
    if (filter) nb = 1*sauve+2*sauveteur+4*sauvetage+8*bateau;
    navigate("/search/"+encodeURI(query)+"/"+nb.toString());
    location.reload();
  }
</script>

<form on:submit={send} >
  <input type="texte" alt="Champ de recherche d'une archive" class="searchTerm" bind:value={query} placeholder="Entrez votre recherche" />
  <input type="button" class="searchButton" alt="Valider la recherche" value="🔍" on:click={send} />
  <label for="search_filter_box">Filtrer</label><input alt="Activer pour filtrer la recherche" bind:checked={filter} id="search_filter_box" type="checkbox" />
  <div>
    <input type="checkbox" bind:checked={sauve} id="filtre_sauve" alt="Filtre: Inclure les sauvés" /><label for="filtre_sauve" >Personnes sauvées</label>
    <input type="checkbox" bind:checked={sauveteur} id="filtre_sauveteur" alt="Filtre: Inclure les sauveteur" /><label for="filtre_sauveteur" >Sauveteur</label>
    <input type="checkbox" bind:checked={bateau} id="filtre_bateau" alt="Filtre: Inclure les bateaux" /><label for="filtre_bateau" >Bateau</label>
    <input type="checkbox" bind:checked={sauvetage} id="filtre_sauvetage" alt="Filtre: Inclure les sauvetages" /><label for="filtre_sauvetage" >Sauvetage</label>
  </div>
</form>


<style>
  #search_filter_box + div{
    display:none;
  }
  #search_filter_box:checked + div{
    display: block;
  }/*
  input{
    font-size: 4vh;
  }*/
  input[type='checkbox'] {
    display: none;
  }/*

  input[type='checkbox']:checked + label{
    text-decoration: underline;
  }*/

  @import url(https://fonts.googleapis.com/css?family=Open+Sans);


.search {
  width: 100%;
  position: relative;
  display: flex;
}

.searchTerm {
  width: 70%;
  border: 3px solid rgb(0,206,209);
  padding: 3%;
  height: 30%;
  border-radius: 5px 0 0 5px;
  outline: none;
  color: #9DBFAF;
}

.searchTerm:focus{
  color: rgb(146,220,253);
}

.searchButton {
  width: 40px;
  height: 36px;
  border: 1px solid rgb(0,206,209);
  background: rgb(0,206,209);
  text-align: center;
  color: #fff;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
}

/*Resize the wrap to see the search bar change!*/
.wrap{
  width: 30%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
