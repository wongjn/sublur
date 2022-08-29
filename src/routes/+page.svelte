<script>
  import Image from '$lib/Image.svelte';
  import { blur } from '$lib/images';

  /** @type {FileSystemDirectoryHandle} */
  let fileHandle;

  const getFileHandle = async () => {
    fileHandle = await window.showDirectoryPicker({
      id: 'sublur',
      mode: 'readwrite',
      startIn: 'documents',
    });
  };

  let episode =
    typeof localStorage !== 'undefined'
      ? parseInt(localStorage.getItem('episode') || '0', 10)
      : 0;
  let minute = 0;

  /** @type {[FileSystemFileHandle, Promise<File>][]} */
  $: files = [];
  $: if (episode && minute) {
    const foundFiles = [];
    const search = `${episode}_0.${minute.toString().padStart(2, '0')}`;
    (async () => {
      for await (const handle of fileHandle.values()) {
        if (handle.name.includes(search) && !handle.name.endsWith('.mp3')) {
          foundFiles.push([handle, handle.getFile()]);
        }
      }
      files = foundFiles;
      localStorage.setItem('episode', episode.toString());
    })();
  }

  let saving = false;
  $: save = async () => {
    saving = true;
    await Promise.allSettled(
      files.map(async ([handle, file]) => {
        const writable = await handle.createWritable();
        await writable.write(await blur(await file));
        await writable.close();
      })
    );
    saving = false;
    files = [];
    minute = 0;
  };
</script>

{#if !fileHandle}
  <button on:click={getFileHandle}> Open folder </button>
{:else}
  <input type="number" min="1" step="1" bind:value={episode} />
  <input type="number" min="1" step="1" bind:value={minute} />
  {#each files as [ filePromise]}
    {#await filePromise then file}
      <Image {file} />
    {/await}
  {/each}
  <button on:click={save} disabled={saving}>Save</button>
{/if}
