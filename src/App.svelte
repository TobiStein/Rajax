<!-- App.svelte -->
<script>
  import { Router, Link, Route } from "svelte-routing";
  import Searchbar from "./layout/SearchBar.svelte";
  import Header from "./layout/Header.svelte";
  import Personnes from "./layout/Personnes.svelte";

  export let url = "";
</script>
<Header />
<Router url="{url}">
  <Route path="debug"><Searchbar /></Route>
  <Route path="debug_arthaud"><Personnes /></Route>
</Router>
