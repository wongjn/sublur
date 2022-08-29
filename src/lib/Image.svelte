<script>
  import { tops, preview } from './images';

  /** @type {File} */
  export let file;

  /** @type {HTMLCanvasElement} */
  let canvas;
  $: canvas && preview(file, canvas);

  const toggleTop = () => {
    $tops[$tops.has(file.name) ? 'delete' : 'add'](file.name);
    $tops = $tops;
    preview(file, canvas);
  };
</script>

<canvas bind:this={canvas} on:click={toggleTop} />
