<script>
  import { marked } from 'marked';

  export let text = "# Test";

</script>

<nav>
  <slot></slot>
</nav>
<div>{@html marked(text)}</div>
