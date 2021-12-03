<script>
  export let nom = "En chargement...";
  export let date = "En chargement...";
</script>

<table>
  <thead>
    <tr>
      <th>Nom</th>
      <th>Date de naissance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{nom==null?"Inconnu":nom}</td>
      <td>{date==null?"Inconnu":date}</td>
    </tr>
  </tbody>
</table>

<style>
  table {
    border-collapse: collapse;
    margin: 25px 0;
    font-size: 0.9em;
    font-family: sans-serif;
    min-width: 400px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);  
    padding-left: 100px;
    border-left-width: 50px;
    margin-left: 50px;
}
thead tr {
    background-color: rgb(146,220,253);
    color: #ffffff;
    text-align: left;
}
td, th {
    padding: 20px 30px;
}

tbody tr {
    border-bottom: 1px solid #dddddd;
}

tbody tr:nth-of-type(even) {
    background-color: #f3f3f3;
}

tbody tr:last-of-type {
    border-bottom: 2px solid #009879;
}
</style>
