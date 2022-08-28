<script>
  import Image from '$lib/Image.svelte';

  /** @type {FileSystemDirectoryHandle} */
  let fileHandle;

  const getFileHandle = async () => {
    fileHandle = await window.showDirectoryPicker({
      id: 'sublur',
      mode: 'readwrite',
      startIn: 'documents',
    });
  };

  let episode = typeof localStorage !== 'undefined'
    ? parseInt(localStorage.getItem('episode') || '0', 10)
    : 0;
  let minute = 0;

  /** @type {FileSystemFileHandle[]} */
  $: files = [];
  $: if (episode && minute) {
    const foundFiles = [];
    const search = `${episode}_0.${minute.toString().padStart(2, '0')}`;
    (async () => {
      for await (const handle of fileHandle.values()) {
        if (handle.name.includes(search) && !handle.name.endsWith('.mp3')) {
          foundFiles.push(handle);
        }
      }
      files = foundFiles;
      localStorage.setItem('episode', episode.toString());
    })();
  }
</script>

{#if !fileHandle}
  <button on:click={getFileHandle}>
    Open folder
  </button>
{:else}
  <input type="number" min="1" step="1" bind:value={episode} />
  <input type="number" min="1" step="1" bind:value={minute} />
  {#each files as handle}
    {#await handle.getFile() then file}
      <Image {file}/>
    {/await}
  {/each}
{/if}
