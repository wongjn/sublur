<script>
  /** @type {File} */
  export let file;

  const WIDTH = 160;
  const HEIGHT = 23;
  const OFFSET_Y = 13;

  let bottom = true;

  /** @type {HTMLCanvasElement} */
  let canvas;
  $: if (canvas) {
    const image = new Image();
    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
      ctx.drawImage(image, 0, 0);

      ctx.strokeStyle = 'lime';
      ctx.strokeRect(
        (canvas.width - WIDTH) / 2,
        bottom ? canvas.height - HEIGHT - OFFSET_Y : OFFSET_Y,
        WIDTH,
        HEIGHT
      );
    };
    image.src = URL.createObjectURL(file);
  }
</script>

<canvas bind:this={canvas} on:click={() => { bottom = !bottom }}/>
