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
    <tr>
      <th>Sauveteurs</th>
      <th>Sauvés</th>
      <th>Date</th>
      <th>Moyens techniques utilisés</th>
    </tr>
    <tr>
      <td>{@html linking(personnes,"SAUVETEUR")}</td>
      <td>{@html linking(personnes,"SAUVE")}</td>
      <td>{date}</td>
      <td>{moyen}</td>
    </tr>
</table>
