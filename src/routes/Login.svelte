<script>
  let username = "";
  let mdp = "";

  import { navigate } from "svelte-routing";

  function typingDat(tp){
    if (tp == "SAUVE" || tp == "SAUVETEUR") return "personne";
    return tp.toLowerCase();
  }

  function send(e){
    e.preventDefault();
    let data = {log_id:username,log_pswd: mdp};
    let option = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json',
            credentials: "same-origin"
        },
        body: JSON.stringify(data)
    };

    fetch("/api/admin",option).then((res)=>{
      console.log(res);
      if (res.status == 200){
        navigate("/searchadmin");
        location.reload();
      }
    })
  }
</script>


<form on:submit={send}>
  <input alt="Nom d'utilisateur" type="text" bind:value={username} />
  <input alt="Mot de passe" type="password" bind:value={mdp} />
  <input type="submit" alt="Valider" value="Valider" />
</form>
