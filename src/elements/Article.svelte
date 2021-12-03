<script>
  import { marked } from 'marked';

  export let text = "# Test";

</script>

<nav>
  <slot></slot>
</nav>
<div id="my-article"><div>{@html marked(text)}</div></div>

<style>
  div#my-article{
    margin:2%;
  }
</style>
