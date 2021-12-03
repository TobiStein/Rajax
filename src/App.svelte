<!-- App.svelte -->
<script>
  import { Router, Link, Route } from "svelte-routing";
  import Searchbar from "./layout/SearchBar.svelte";
  import Search from "./routes/Search.svelte";
  import Header from "./layout/Header.svelte";
  import EasterEgg from "./layout/EasterEgg.svelte";
  import Tibo from "./layout/Tibo.svelte";
  import Article from "./routes/Article.svelte";
  import Voeux from "./layout/Voeux.svelte"
  import Bateaux from "./elements/Bateaux.svelte"
  import Personnes from "./elements/Personnes.svelte"
  import Sauvetage from "./elements/Sauvetage.svelte"
  export let url = "";
</script>
<Header />
<Router url="{url}">
  <Route path="tiboaveugle"><Tibo /></Route>
  <Route path="debug"><Article text="# Je suis sympa non" /></Route>
  <Route path="article/:type/:id" let:params><Article artType={params.type} artId={params.id}/></Route>
  <Route path="search/:query/:filters" let:params><Search query={params.query} filters={params.filters}/></Route>
  <Route path="debug_arthaud"><EasterEgg /></Route>
  <Route path="creer-voeux"><Voeux /></Route>
</Router>
