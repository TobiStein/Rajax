<script>
  export let nom = "En chargement...";
  export let date = "En chargement...";
</script>

<table>
    <tr>
      <th>Nom</th>
      <th>Date</th>
    </tr>
    <tr>
      <td>{nom==null?"Inconnu":nom}</td>
      <td>{date==null?"Inconnu":date}</td>
    </tr>
</table>
