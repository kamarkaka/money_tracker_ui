<script lang="ts">
import { postForm, type Category, type Label, type Transaction } from '$lib/api';

let {
    categories,
    transaction
} = $props();

let ruleCategoryId = $state(transaction.category?.id);
let ruleDescription = $state(transaction.description);
let labelName = $state("");

function handleClickUpdateTransaction() {
    console.log('handleClickUpdateTransaction');
}

function handleClickSaveRule() {
    console.log('handleClickSaveRule');
}

async function handleClickAddLabel() {
    const labelId: number = await postForm('transactions/add-label', {
        'id': transaction.id,
        'label-name': labelName
    });
    transaction.labels.push({id: labelId, name: labelName});
}

async function handleClickDeleteLabel(labelId: number) {
    const deleted: number = await postForm('transactions/delete-label', {
        'id': transaction.id,
        'label-id': labelId
    });
    let index = transaction.labels.findIndex((l:Label) => l.id === labelId);
    transaction.labels.splice(index, 1);
}
</script>

<div class="info">
    <span>Account: {transaction.account.name}</span>
    <input id="is-duplicated" type="checkbox" bind:checked={transaction.isDuplicated} /><label for="is-duplicated">Mark as Duplicated</label>
    <input id="is-hidden" type="checkbox" bind:checked={transaction.isHidden} /><label for="is-hidden">Mark as Hidden</label>
    <textarea bind:value={transaction.note} placeholder="Transaction Notes"></textarea>
    <button onclick={handleClickUpdateTransaction}>Save</button>
</div>
<div class="rule">
    <span>Create Rule</span>
    <label for="rule-text">Transactions that contain text:</label>
    <input id="rule-text" type="text" bind:value={ruleDescription}/><br/>
    <label for="rule-category">Will be categorized into</label>
    <select id="rule-category" bind:value={ruleCategoryId}>
        {#each categories as category}
        <option value={category.id}>{category.name}</option>
            {#each category.children as child}
            <option value={child.id}>{child.name}</option>
            {/each}
        {/each}
    </select>
    <button onclick={handleClickSaveRule}>Save Rule</button>
</div>
<div class="label">
    <span>Labels</span>
    {#each transaction.labels as label}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <span class="transaction-label">{label.name} <icon role="button" aria-pressed="false" tabindex="-1" onclick={() => handleClickDeleteLabel(label.id)}>x</icon></span>
    {/each}
    <label for="new-label">Create Label: </label><input id="new-label" type="text" bind:value={labelName}/>
    <button onclick={handleClickAddLabel}>+</button>
</div>
<div class="split">
    <span>Split Transaction:</span>
    <label for="split-amount1"><input id="split-amount1" type="text"/>
    <label for="split-amount2"><input id="split-amount2" type="text"/>
    <button>Split</button>
</div>

<style>
.info {
    border-bottom: 1px solid #ccc;
    padding: 10px 0;
}
.info span {
    font-weight: bold;
}
.info input,
.info label {
    float: right;
}
.info label {
    margin-left: 10px;
}
.info textarea {
    height: 32px;
    margin-top: 10px;
    width: 750px;
}
.info button {
    float: right;
    height: 38px;
    margin: 0;
    margin-top: 10px;
    padding: 0;
    vertical-align: top;
    width: 38px;
}
.rule {
    border-bottom: 1px solid #ccc;
    padding: 10px 0;
}
.rule span {
    display: block;
    font-weight: bold;
    margin-bottom: 10px;
}
.rule input {
    display: inline-block;
    width: 400px;
}
.rule label {
    display: inline-block;
    margin-top: 5px;
}
.rule button {
    float: right;
    height: 38px;
    margin: 0;
    margin-top: -21px;
    padding: 0;
    width: 38px;
}
.label {
    border-bottom: 1px solid #ccc;
    padding: 10px 0;
}
.label span {
    display: block;
    font-weight: bold;
    margin-bottom: 10px;
}
.label .transaction-label {
    background-color: #ccc;
    border-radius: 5px;
    float: left;
    font-weight: 100;
    height: 30px;
    line-height: 30px;
    padding-left: 10px;
    margin: 0;
    margin-right: 10px;
}
.label .transaction-label icon {
    float: right;
    height: 30px;
    margin-left: 10px;
    text-align: center;
    width: 30px;
}
.label .transaction-label icon:hover {
    background-color: #aaa;
    border-radius: 5px;
}
.label label {
    height: 30px;
    line-height: 30px;
}
.split {
    padding: 10px 0;
}
.split span {
    display: block;
    font-weight: bold;
    margin-bottom: 10px;
}

</style>