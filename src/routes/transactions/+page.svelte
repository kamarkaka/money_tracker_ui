<script lang="ts">
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import { DateTime } from "luxon";

import { loadCategories, loadTransactions } from '$lib/api';
import { defaultCSO, defaultPO } from "$lib/stores";
import TransactionList from './list.svelte';
import CategorySelector from "../category-selector.svelte";

/**
 * Search Form
 */
const now = DateTime.now();

let beginDateStr = $state(now.startOf('month').toFormat('yyyy-MM-dd'));
let endDateStr = $state(now.endOf('month').toFormat('yyyy-MM-dd'));
let descriptionQueryStr = $state("");
let categoryIds = $state([]);
let amountMin = $state(0);
let amountMax = $state(0);
let showHidden = $state(false);
let showDuplicated = $state(false);
let showUncategorized = $state(true);
let transactions = $state([]);
let loadingTransactions = $state(false);
let pagination = $state(defaultPO);

async function handleSubmit() {
    loadingTransactions = true;

    const params = {
        beginDate: DateTime.fromFormat(beginDateStr, 'yyyy-MM-dd'),
        endDate: DateTime.fromFormat(endDateStr, 'yyyy-MM-dd'),
        accountIds: [],
        amount: {
            min: amountMin,
            max: amountMax
        },
        budgetId: null,
        categoryIds: categoryIds,
        query: descriptionQueryStr,
        showUncategorized: showUncategorized,
        showHidden: showHidden,
        showDuplicated: showDuplicated
    };

    transactions = await loadTransactions(params);
    pagination.total = transactions.length;
    pagination.offset = 0;
    loadingTransactions = false;
}

/**
 * Category Selector
 */
let selectedTransaction = $state(null);
let selectedCategory = $state(null);
let categorySelectorOptions = $state(defaultCSO);

/**
 * Initialization
 */
 let categories = $state([]);
onMount(async () => {
    categories = await loadCategories();
});
</script>

{#if loadingTransactions}
<div class="loading" out:fade={{delay: 1000}}>Loading Transactions...</div>
{/if}

<h1>Transactions</h1>
<CategorySelector
    data = {categories}
    options = {categorySelectorOptions} 
    categoryQuery = {""}
    selectedTransaction = {selectedTransaction}
/>

<div class="search-form">
    <div class="search-form-row">
        <label for="date-from">Date Range: </label>
        <input id="date-from" type="date" bind:value={beginDateStr}/>
        <label for="date-to"> - </label>
        <input id="date-to" type="date" bind:value={endDateStr}/>
    </div>
    <div class="search-form-row">
        <label for="description">Description: </label>
        <input id="description" type="text" bind:value={descriptionQueryStr}/>
    </div>
    <div class="search-form-row">
        <label for="categories">Categories: </label>
        <select id="categories" multiple bind:value={categoryIds}>
            {#each categories as category (category.id)}
                <option value={category.id}>{category.name}</option>
                {#if category.children.length > 0}
                    {#each category.children as child (child.id)}
                        <option value={child.id}>{child.name}</option>
                    {/each}
                {/if}
            {/each}
        </select>
    </div>
    <div class="search-form-row">
        <label for="amount-min">Amount &ge;</label>
        <input id="amount-min" type="number" min=0 bind:value={amountMin}/>
        <label for="amount-max">Amount &le;</label>
        <input id="amount-max" type="number" min=0 bind:value={amountMax}/>
    </div>
    <div class="search-form-row submit">
        <input id="show-hidden" type="checkbox" bind:checked={showHidden}/>
        <label for="show-hidden">Show Hidden</label>
        <input id="show-duplicated" type="checkbox" bind:checked={showDuplicated}/>
        <label for="show-duplicated">Show Duplicated</label>
        <input id="show-uncategorized" type="checkbox" bind:checked={showUncategorized}/>
        <label for="show-uncategorized">Show Uncategorized</label>
        <button onclick={handleSubmit}>Submit</button>
    </div>
</div>

{#if transactions}
<TransactionList
    budget = {null}
    categories = {categories}
    transactions = {transactions}
    showSort = {true}
    showPagination = {true}
    pagination = {pagination}
    selectedTransaction = {selectedTransaction}
    selectedCategory = {selectedCategory}
    categorySelectorOptions = {categorySelectorOptions}
/>
{/if}

<style>
.search-form {
    width: 820px;
}
.search-form-row {
    align-items: center;
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
}
.search-form input, select, button {
    background-color: #fff;
    border: 1px solid #3272a9;
    border-radius: 3px;
    color: #3272a9;
    cursor: pointer;
    font-size: 14px;
    padding: 0 10px;
}
.search-form input, select, label, button {
    height: 35px;
    line-height: 35px;
    margin-bottom: 10px;
    margin-right: 10px;
}
.search-form button:hover {
    background-color: #3272a9;
    color: #fff;
}
.search-form select {
    height: 120px;
    padding: 5px 10px;
}
.search-form label[for=date-to] {
    width: auto;
}
.search-form label[for=show-hidden],
.search-form label[for=show-duplicated] {
    width: auto;
}
.search-form #description {
    width: 320px;
}
.search-form #amount-min, #amount-max {
    text-align: right;
    width: 80px;
}
.search-form-row {
    justify-content: center;
}
.loading {
    background-color: #fff;
    left: 50%;
    position: fixed;
    top: 50%;
    width: 120px;
}
</style> 