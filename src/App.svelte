<!-- App.svelte -->
<script>
  import { Router, Link, Route } from "svelte-routing";
  import Searchbar from "./layout/SearchBar.svelte";

  export let url = "";
</script>

<Router url="{url}">
  <Route path="debug"><Searchbar /></Route>
</Router>
