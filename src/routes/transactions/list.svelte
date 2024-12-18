<script lang="ts">
import { onMount } from 'svelte';
import { cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';
import { slide } from 'svelte/transition';
import { DateTime } from "luxon";

import { defaultTDO, defaultTSO } from '$lib/stores';
import { formatAmount, transactionSortFn } from '$lib/util';
import TransactionDetail from './detail.svelte';

/**
 * Component Inputs
 * budget: a Budget object {name, amount}
 * categories: a list of categories fetched from api
 * transactions: a list of transactions fetch from api
 * showSort: true to show sort row
 * showPagination: true to show pagination
 * selectedTransaction: selected transaction
 * selectedCategory: selected category
 * categorySelectorOptions: category selector options
 */
let {
    budget,
    categories,
    transactions,
    showSort,
    showPagination,
    pagination,
    selectedTransaction = $bindable(),
    categorySelectorOptions = $bindable()
} = $props();

// Handles the open/close of category selector
function handleClickCategorySelector(event, clickedTransaction) {
    event.preventDefault();
    event.stopPropagation();

    const node = event.target as HTMLElement;
    const rect = node.getBoundingClientRect();

    let left = rect.left + window.scrollX;
    let top;
    if (rect.top + rect.height + 457 > window.innerHeight) {
        top = rect.top + window.scrollY - 457;
    } else {
        top = rect.top + rect.height + window.scrollY;
    }

    if (selectedTransaction?.id != clickedTransaction.id) {
        selectedTransaction = clickedTransaction;

        categorySelectorOptions.show = true;
        categorySelectorOptions.position.left = left;
        categorySelectorOptions.position.top = top;
    } else {
        categorySelectorOptions.show = !categorySelectorOptions.show;
    }
}

/**
 * Budget Progress
 * progress: a progress bar
 * transactionTotal: total amount of transactions under a budget group
 * budgetProgress: a percentage of (transactionTotal / budget.amount)
 * progressClass: a class for the progress bar to render in different color
 */
const progress = new Tween(0, { duration: 1000, easing: cubicOut });
let transactionTotal = $state(0);
let progressClass = $state('');

onMount(() => {
    if (budget != null) {
        transactionTotal = transactions.reduce((a , t) => { return a + t.amount}, 0);

        let budgetProgress = 0;

        if (Math.abs(budget.amount) < 0.01) {
            budgetProgress = 0;
        } else {
            budgetProgress = Math.min(1, transactionTotal / budget.amount);
        }

        if (budgetProgress <= 0.5) {
            progressClass = 'pass';
        } else if (budgetProgress <= 0.8) {
            progressClass = 'warning';
        } else {
            progressClass = 'error';
        }

        progress.set(budgetProgress);
    }
});

/**
 * Transactions Sorting, Detail Panel, and Pagination
 */
let transactionSort = $state(defaultTSO);
let transactionDetail = $state(defaultTDO);

function sortBy(name) {
    if (transactionSort.field == name) {
        transactionSort.order = transactionSort.order == 'asc' ? 'desc' : 'asc';
    } else {
        transactionSort.field = name;
        transactionSort.order = 'asc';
    }
}

function handleClickDetail(transaction) {
    if (transactionDetail.transaction == null || transactionDetail.transaction.id != transaction.id) {
        transactionDetail.show = true;
        transactionDetail.transaction = transaction;
    } else {
        transactionDetail.show = !transactionDetail.show;
    }
}

function setPage(pageNumber) {
    if (pageNumber == -2) {
        pagination.offset = 0;
    } else if (pageNumber == -1) {
        pagination.offset = Math.max(pagination.offset - 1, 0);
    } else if (pageNumber == 1) {
        pagination.offset = Math.min(pagination.offset + 1, Math.ceil(pagination.total / pagination.limit) - 1);
    } else {
        pagination.offset = Math.ceil(pagination.total / pagination.limit) - 1;
    }
}

let transactionsToShow = $derived.by(() => {
    transactions.sort(transactionSortFn[transactionSort.field][transactionSort.order]);

    if (showPagination) {
        return transactions.slice(pagination.offset * pagination.limit, pagination.offset * pagination.limit + pagination.limit);
    }
    return transactions;
});
</script>

{#if budget}
    <h1>
        {budget.name}
        <span class="group-total">
            {formatAmount(Math.abs(transactionTotal))}
            {#if Math.abs(budget.amount) > 0}
            / {formatAmount(Math.abs(budget.amount))}
            {/if}
        <span>
    </h1>
    {#if Math.abs(budget.amount) >= 0.01}
        <progress value={progress.current} class={progressClass}></progress>
    {/if}
{/if}

<table class="transaction-table">
    {#if showSort}
    <thead>
        <tr>
            <td class="transaction-title transaction-date" onclick={() => sortBy('date')}>Date</td>
            <td class="transaction-title transaction-description" onclick={() => sortBy('description')}>Description</td>
            <td class="transaction-title transaction-category" onclick={() => sortBy('category')}>Category</td>
            <td class="transaction-title transaction-amount" onclick={() => sortBy('amount')}>Amount</td>
        </tr>
    </thead>
    {/if}
    <tbody>
    {#each transactionsToShow as transaction (transaction.id)}
        <tr onclick={() => { handleClickDetail(transaction); }}>
            <td class="transaction-date">
                {transaction.date.toLocaleString(DateTime.DATE_MED)}
            </td>
            <td class="transaction-description">
                {transaction.description.length <= 48 ? transaction.description : transaction.description.substring(0, 48) + "..."}
            </td>
            <td class="transaction-category" onclick={(e) => { handleClickCategorySelector(e, transaction); }}>
                {#if transaction.id != selectedTransaction?.id}
                    {transaction.category == undefined ? 'N/A' : transaction.category.name}
                {:else}
                    {selectedTransaction.category == undefined ? 'N/A' : selectedTransaction.category.name}
                {/if}
            </td>
            <td class="transaction-amount {transaction.amount > 0 ? 'income' : ''}">
                {formatAmount(transaction.amount)}
            </td>
        </tr>

        {#if transactionDetail.show && transactionDetail.transaction?.id == transaction.id}
            <tr class="transaction-detail" transition:slide>
                <td colspan=4>
                    <TransactionDetail
                        transaction = {transaction}
                        categories = {categories}
                    />
                </td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>

{#if showPagination}
<div class="pagination">
    <button class="prev" onclick={() => setPage(-2)}>|&lt;</button>
    <button class="prev" onclick={() => setPage(-1)}>&lt;</button>
    <span>Page {pagination.offset + 1} of {Math.ceil(pagination.total / pagination.limit)}</span>
    <button class="next" onclick={() => setPage(1)}>&gt;</button>
    <button class="next" onclick={() => setPage(2)}>&gt;|</button>
</div>
{/if}

<style>
.group-total {
    float: right;
}

progress {
    border-radius: 3px;
    box-shadow: 1px 1px 4px rgba( 0, 0, 0, 0.2 );
    height: 30px;
    margin: 0;
    margin-top: -15px;
    padding: 0;
    width: 100%;
}
progress::-webkit-progress-bar {
    background-color: #ddd;
    border-radius: 3px;
}
progress::-webkit-progress-value {
    border-radius: 3px;
}
.error::-webkit-progress-value {
    background-color: #D9534F;
}
.warning::-webkit-progress-value {
    background-color: #F0AD4E;
}
.pass::-webkit-progress-value {
    background-color: #5CB85C;
}

.transaction-table {
    display: block;
    font-size: 14px;
}
.transaction-table tr {
    background-color: #fff;
    border: 0;
    border-bottom: 1px solid #ddd;
    display: flex;
    padding: 0;
    width: fit-content;
}
.transaction-table tr:hover {
    background-color: #f0f8ff;
    cursor: pointer;
}
.transaction-table td {
    display: block;
    height: 30px;
    padding: 0;
    padding-top: 10px;
}
.transaction-table td.transaction-date {
    padding-left: 10px;
    width: 100px;
}
.transaction-table td.transaction-description {
    color: #3272a9;
    font-weight: 700;
    overflow: hidden;
    width: 450px;
}
.transaction-table td.transaction-category {
    color: #3272a9;
    font-weight: 700;
    width: 150px;
    user-select: none;
}
.transaction-table td.transaction-amount {
    color: #000000;
    font-weight: 700;
    text-align: right;
    padding-right: 10px;
    width: 100px;
}
.transaction-table td.income {
    color: green;
}
.transaction-table .transaction-detail td {
    background-color: #f0f8ff;
    height: 320px;
    padding: 10px;
    width: 800px;
}
.transaction-table td.transaction-title {
    background-color: #f0f8ff;
    color: #000000;
    font-weight: bold;
    user-select: none;
}

.pagination {
    font-size: 0;
    height: 30px;
    margin: auto;
    margin-top: 10px;
    user-select: none;
    width: 240px;
}
.pagination button {
    background-color: #fff;
    border: none;
    cursor: pointer;
    display: inline-block;
    font-size: 15px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    width: 30px;
}
.pagination button:hover {
    background-color: #f0f8ff;
}
.pagination span {
    display: inline-block;
    font-size: 15px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    width: 120px;
}
</style>