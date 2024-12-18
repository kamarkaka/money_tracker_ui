<script lang="ts">
import { cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';
import { fade } from 'svelte/transition';

import { uploadTransactions } from '$lib/api';

const progress = new Tween(0, { duration: 1000, easing: cubicOut });
let files = $state();

$effect(() => {
    if (files == undefined || files == null) return;

    let typedFiles = files as FileList;
    if (typedFiles.length < 1) return;

    console.log("file selected!");
    uploadTransactions(typedFiles.item(0), (e) => {
        progress.set(e.loaded / e.total);

        if (e.loaded == e.total) {
            setTimeout(() => {
                console.log('Upload complete!');
                files = undefined;
            }, 2000);
        }
    });
});
</script>

<label for="file-uploader">Upload CSV</label>
<input id="file-uploader" type="file" class="upload" accept=".csv" bind:files={files as FileList} />
{#if files != undefined && (files as FileList)?.item(0) != null}
    <progress value={progress.current} data-label="{(files as FileList)?.item(0)?.name}" out:fade></progress>
{/if}

<style>
input.upload {
    background-color: #fff;
    border: 1px solid #3272a9;
    border-radius: 3px;
    color: #3272a9;
    cursor: pointer;
    font-size: 14px;
    padding: 4px;
    width: 22px;
}
input.upload::-webkit-file-upload-button {
    visibility: hidden;
}
input.upload:before {
    content: '+';
    padding-left: 7px;
}
input.upload:hover {
    background-color: #f0f8ff;
    border-color: #1f3444;
    color: #1f3444;
}

progress {
    border-radius: 3px;
    box-shadow: 1px 1px 4px rgba( 0, 0, 0, 0.2 );
    float: right;
    height: 32px;
    position: relative;
    text-align: center;
    width: 210px;
    -webkit-appearance: none;
}
progress:before {
    color: white;
    content: attr(data-label);
    font-size: 0.8em;
    left:0;
    padding-top: 8px;
    position:absolute;
    right:0;
}
progress::-webkit-progress-bar {
    background-color: #ddd;
    border-radius: 3px;
}
progress::-webkit-progress-value {
    background-color: rgb(92, 184, 92);
    border-radius: 3px;
}
</style>
