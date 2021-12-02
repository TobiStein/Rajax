<script>
  let query = "";

</script>

<form>
  <input type="texte" alt="Champ de recherche d'une archive" value="" placeholder="Entrez votre recherche" />
  <input type="button" alt="Valider la recherche" value="🔍" />
  <label for="search_filter_box">Filtrer</label><input alt="Activer pour filtrer la recherche" id="search_filter_box" type="checkbox" />
  <div>
    <input type="checkbox" id="filtre_sauve" alt="Inclure les sauvetages" /><label for="filtre_sauve" >Personnes sauvées</label>
    <input type="checkbox" id="filtre_sauveteur" alt="Inclure les sauveteur" /><label for="filtre_sauveteur" >Sauveteur</label>
    <input type="checkbox" id="filtre_bateau" /><label for="filtre_bateau" >Bateau</label>
    <input type="checkbox" id="filtre_sauvetage" /><label for="filtre_sauvetage" >Sauvetage</label>
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
