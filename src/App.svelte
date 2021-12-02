<!-- App.svelte -->
<script>
  import { Router, Link, Route } from "svelte-routing";
  import Header from "./layout/Header.svelte";

  export let url = "";
</script>
<Header />
<Router url="{url}">
    <Route path="debug" component="{Debug}" />
</Router>
