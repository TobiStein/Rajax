<script>
  export let personnes = "En chargement";

  let sauveteur,sauve;

  function linking(sav,role){
    if (sav == "En chargement") return sav;
    if (sav == null) return "Inconnu";
    var t = "";

    for (var i of sav){
      if (i.role == role){
        t += `<a href="/article/personne/${i.id.toString()}">${i.nom}</a>,`
      }
    }
    return t == "" ? "Inconnu":t;
  }

  export let date = "En chargement...";
  export let moyen = "En chargement...";
</script>


<table>
  <thead>
    <tr>
      <th>Sauveteurs</th>
      <th>Sauvés</th>
      <th>Date</th>
      <th>Moyens techniques utilisés</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{@html linking(personnes,"SAUVETEUR")}</td>
      <td>{@html linking(personnes,"SAUVE")}</td>
      <td>{date}</td>
      <td>{moyen}</td>
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
