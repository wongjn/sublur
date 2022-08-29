<script>
  import { fly } from 'svelte/transition';
  import { get, set } from 'idb-keyval';
  import Image from '$lib/Image.svelte';
  import { blur } from '$lib/images';

  /** @type {FileSystemDirectoryHandle} */
  let fileHandle;

  const getFileHandle = async () => {
    const storedHandle = await get('filehandle');
    if (storedHandle) {
      const options = { mode: 'readwrite' };
      if (
        (await storedHandle.queryPermission(options)) === 'granted' ||
        (await storedHandle.requestPermission(options)) === 'granted'
      ) {
        fileHandle = storedHandle;
        return;
      }
    }

    fileHandle = await window.showDirectoryPicker({
      id: 'sublur',
      mode: 'readwrite',
      startIn: 'documents',
    });
    await set('filehandle', fileHandle);
  };

  let episode =
    typeof localStorage !== 'undefined'
      ? parseInt(localStorage.getItem('episode') || '0', 10)
      : 0;
  let minute = 0;

  /** @type {[FileSystemFileHandle, Promise<File>][]} */
  $: files = [];
  $: if (episode && minute) {
    files = [];
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

<svelte:head>
  <title>Sublur</title>
</svelte:head>

{#if !fileHandle}
  <button
    on:click={getFileHandle}
    class="h-full w-full text-3xl font-bold uppercase"
  >
    Open folder
  </button>
{:else}
  <form class="h-full flex gap-8 p-8">
    <div class="space-y-4 sticky top-0">
      <p class="flex gap-2 justify-between items-baseline">
        <label for="episode">Episode</label>
        <input
          type="number"
          id="episode"
          min="1"
          step="1"
          bind:value={episode}
          class="w-[4ch] p-1 pr-0 bg-white dark:bg-black font-mono text-right"
        />
      </p>
      <p class="flex gap-2 justify-between items-baseline">
        <label for="minute">Minute</label>
        <input
          type="number"
          id="minute"
          min="1"
          step="1"
          bind:value={minute}
          class="w-[4ch] p-1 pr-0 bg-white dark:bg-black font-mono text-right"
        />
      </p>
    </div>
    <div class="flex flex-col gap-6 items-start overflow-y-auto">
      <ul class="flex flex-wrap gap-4">
        {#each files as [_, filePromise], i}
          {#await filePromise then file}
            <li in:fly={{ y: 10, duration: 150, delay: i * 5 }}>
              <Image {file} />
            </li>
          {/await}
        {/each}
      </ul>
      {#if files.length > 0}
        {#await Promise.allSettled(files.map(([, file]) => file)) then _}
          <button
            in:fly={{ y: 10, duration: 150, delay: files.length * 5 }}
            on:click={save}
            class="bg-blue-700 text-white rounded p-4 text-2xl font-bold uppercase disabled:opacity-50"
            disabled={saving}>Save</button
          >
        {/await}
      {:else if episode > 0 && minute > 0}
        <p>Loading…</p>
      {:else}
        <p>Select an episode and minute to continue.</p>
      {/if}
    </div>
  </form>
{/if}
