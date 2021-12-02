<script>
  import SearchBar from "./SearchBar.svelte";
</script>

<header>
    <img
     src="./img/corsaire.png"
     alt="logo corsaire dunkerquois">
    <SearchBar />
</header>

<style>
  header {
	background-color: rgb(2, 18, 43);
	margin : 0;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
}

  header img {
  }
</style>
