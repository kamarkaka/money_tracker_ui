<script lang="ts">
import { onMount } from 'svelte';
import { DateTime } from "luxon";

import { loadBudgets, loadCategories, loadTransactions } from '$lib/api';
import { defaultCSO, defaultPO } from '$lib/stores';
import CategorySelector from './category-selector.svelte';
import FileUploader from './file-uploader.svelte';
import TransactionList from './transactions/list.svelte';

/**
 * Date selector
 */
const now = DateTime.now();
let dates = [];
for (let i = 0; i < 8; i++) {
    dates.push(now.minus({months: i}));
}

let selectedDate = $state(now.startOf('month'));
let beginDate = $state(now.startOf('month'));
let endDate = $state(now.endOf('month'));
let beginDateStr = $derived(beginDate.toFormat('yyyy-MM-dd'));
let endDateStr = $derived(endDate.toFormat('yyyy-MM-dd'));

function setDates(date) {
    if (date == selectedDate) return;

    selectedDate = date;
    beginDate = date.startOf('month');
    endDate = date.endOf('month');
}

function handleClickSetDate() {
    beginDate = DateTime.fromFormat(beginDateStr, 'yyyy-MM-dd');
    endDate = DateTime.fromFormat(endDateStr, 'yyyy-MM-dd');
    selectedDate = null;
}

/**
 * Category Selector
 */
let categories = $state([]);
let categorySelectorOptions = $state(defaultCSO);
let categoryQuery = $state("");
let selectedTransaction = $state(null);
let selectedCategory = $state(null);
let pagination = $state(defaultPO);

/**
 * Initialization
 */
let budgets = $state([]);
onMount(async () => {
    budgets = await loadBudgets();
    categories = await loadCategories();
});
</script>

<h1>Spending from {beginDate.toLocaleString(DateTime.DATE_MED)} to {endDate.toLocaleString(DateTime.DATE_MED)}</h1>
<div class="date-selector">
{#each dates as date}
    <button class="{selectedDate == date ? 'selected' : ''}" onclick={() => setDates(date)}>{date.toFormat('MMM, yyyy')}</button>
{/each}
</div>
<div class="date-range">
    Custom Date Range: 
    <input type="date" value={beginDateStr}> - <input type="date" value={endDateStr}> 
    <button onclick={() => handleClickSetDate()}>GO</button>
</div>
<FileUploader />
<CategorySelector
    bind:data = {categories}
    bind:options = {categorySelectorOptions}
    bind:categoryQuery = {categoryQuery}
    bind:selectedTransaction = {selectedTransaction}
/>

{#if budgets.length > 0}
    {#each budgets as budget (budget.id)}
    {#await loadTransactions({
        beginDate: beginDate,
        endDate: endDate,
        budgetId: budget.id,
        showUncategorized: true,
        accountIds: [],
        amount: {
            min: 0,
            max: 0,
        }, 
        categoryIds: [], 
        query: '',
        showDuplicated: false,
        showHidden: false,
    })}
        <p>Loading Transactions...</p>
    {:then transactions}
        <TransactionList
            budget = {budget}
            categories = {categories}
            transactions = {transactions}
            showSort = {false}
            showPagination = {false}
            pagination = {pagination}
            bind:selectedTransaction = {selectedTransaction}
            bind:categorySelectorOptions={categorySelectorOptions}
        />
    {:catch error}
        <p>Something went wrong: {error.message}</p>
    {/await}
    {/each}
{:else}
    <p>Loading Budgets...</p>
{/if}

<style>
.date-selector button,
.date-range input, button {
    background-color: #fff;
    border: 1px solid #3272a9;
    border-radius: 3px;
    color: #3272a9;
    cursor: pointer;
    font-size: 14px;
    height: 35px;
    margin-bottom: 10px;
    padding: 0 10px;
}
.date-selector button {
    margin-right: 10px;
}
.date-selector button.selected {
    background-color: #3272a9;
    color: #fff;
}
.date-range input {
    height: 33px;
    width: 110px;
}
button:hover,
input:hover {
    background-color: #f0f8ff;
    border-color: #1f3444;
    color: #1f3444;
}

input {
    width: 60px;
}
</style>