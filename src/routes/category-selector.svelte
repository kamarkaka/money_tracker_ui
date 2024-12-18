<script lang="ts">
import { fade } from 'svelte/transition';
import { updateCategory } from '$lib/api';
import { searchCategory } from '$lib/category';

let {
    data = $bindable(),
    options = $bindable(),
    categoryQuery = $bindable(),
    selectedTransaction = $bindable(),
} = $props();

function handleInputCategoryQuery() {
    data = searchCategory(data, categoryQuery);
}

// Handles category updates to a transaction
function handleSelectCategory(event, selectedCategory) {
    event.preventDefault();
    event.stopPropagation();

    if (selectedTransaction != undefined && selectedCategory != undefined && (selectedTransaction.category == undefined || selectedTransaction.category.id != selectedCategory.id)) {
        const promise = updateCategory(selectedTransaction.id, selectedCategory.id);
        promise.then(updated => {
            if (updated > 0) {
                selectedTransaction.category = selectedCategory;
                selectedTransaction = selectedTransaction;
                console.log("category updated!");
            }
        });
    }

    options.show = false;
}

</script>

{#if options.show}
    <div class="category-selector" 
         style="--pos-top: {options.position.top}px; --pos-left: {options.position.left}px"
         transition:fade={{duration: 100}}>
        <input bind:value={categoryQuery} oninput={handleInputCategoryQuery}>
        <div class="category-list">
            {#each data as category (category.id)}
            {#if !category.isHidden}
                <button class="parent-category" onclick={(event) => handleSelectCategory(event, category)}>
                    {category.name}
                </button>

                {#if category.children.length > 0}
                    {#each category.children as child (child.id)}
                    {#if !child.isHidden}
                        <button class="child-category" onclick={(event) => handleSelectCategory(event, child)}>
                            {child.name}
                        </button>
                    {/if}
                    {/each}
                {/if}
            {/if}
            {/each}
        </div>
    </div>
{/if}

<style>
.category-selector {
    background-color: #ffffff;
    box-shadow: 0 3px 8px 0 rgba(0,0,0,.35);
    color: #000;
    font-size: 14px;
    font-weight: 400;
    left: var(--pos-left);
    line-height: 20px;
    max-height: 480px;
    overflow: hidden;
    position: absolute;
    top: var(--pos-top);
    width: 240px;
}
.category-selector input {
    border: 1px solid #ccc;
    height: 32px;
    margin: 10px;
    width: 210px;
}
.category-selector input:focus {
    outline: none;
}
.category-selector .category-list {
    border-top: 1px solid #ccc;
    max-height: 400px;
    overflow-x: hidden;
    overflow-y: scroll;
    width: 100%;

    &::-webkit-scrollbar-thumb:hover {
        background-color: #a8a8a8;
    }

    &::-webkit-scrollbar-track {
        background-color: #f1f1f1;
        -webkit-box-shadow: inset 0 0 6px rgba(83, 83, 83, 0.07);
    }

    &::-webkit-scrollbar {
        background-color: #f1f1f1;
        width: 7px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #c1c1c1;
    }
}
.category-selector button {
    background-color: #fff;
    border: none;
    cursor: pointer;
    display: block;
    height: 30px;
    line-height: 30px;
    margin: 0;
    padding: 0;
    padding-left: 20px;
    width: 100%;
    text-align: left;
}
.category-selector button:hover {
    background-color: #1f3444;
    color: #fff;
}
</style>
