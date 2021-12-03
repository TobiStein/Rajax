<!-- App.svelte -->
<script>
  import { Router, Link, Route } from "svelte-routing";
  import Searchbar from "./layout/SearchBar.svelte";
  import Search from "./routes/Search.svelte";
  import Header from "./layout/Header.svelte";
  import EasterEgg from "./layout/EasterEgg.svelte";
  import Personnes from "./layout/Personnes.svelte";
  import Article from "./elements/Article.svelte";
  import Tibo from "./layout/Tibo.svelte";
  export let url = "";
</script>
<Header />
<Router url="{url}">
  <Route path="tiboaveugle"><Tibo /></Route>
  <Route path="debug"><Article text="# Je suis sympa non" /></Route>
  <Route path="search/:query/:filters" let:params><Search query={params.query} filter={params.filters}/></Route>
  <Route path="debug_arthaud"><EasterEgg /></Route>
</Router>
