<script>
  export let nom = "En chargement...";
  export let modele = "En chargement...";
  export let annee = "En chargement...";
</script>

<table>
    <tr>
      <th>Nom</th>
      <th>Modèle</th>
      <th>Année de mise en service</th>
    </tr>
    <tr>
      <td>{nom==null?"Inconnu":nom}</td>
      <td>{modele==null?"Inconnu":modele}</td>
      <td>{annee==null?"Inconnu":annee}</td>
    </tr>
</table>
