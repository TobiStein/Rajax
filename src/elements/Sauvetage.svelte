<script>
  export let personnes = "En chargement";

  $:sauveteurs = linking(personnes,"SAUVETEUR");
  $:sauve = linking(personnes,"SAUVE");


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
    <tr>
      <th>Sauveteurs</th>
      <th>Sauvés</th>
      <th>Date</th>
      <th>Moyens techniques utilisés</th>
    </tr>
    <tr>
      <td>{$sauveteurs}</td>
      <td>{$sauve}</td>
      <td>{date}</td>
      <td>{moyen}</td>
    </tr>
</table>
