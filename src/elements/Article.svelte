<script>
  import { marked } from 'marked';

  export let text = "# Test";

</script>

<div>{@html marked(text)}</div>
