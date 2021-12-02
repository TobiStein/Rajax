<!-- App.svelte -->
<script>
  import { Router, Link, Route } from "svelte-routing";
  import Searchbar from "./layout/SearchBar.svelte";
  import Search from "./routes/Search.svelte";

  export let url = "";
</script>

<Router url="{url}">
  <Route path="debug"><Searchbar /></Route>
  <Route path="search/:query/:filters"><Search query={params.query} filter={params.filters}/></Route>
</Router>
