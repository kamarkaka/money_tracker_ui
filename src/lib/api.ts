import { DateTime } from "luxon";
import { transactionSortFn } from "./util";

const apiEndpoint = `${import.meta.env.VITE_API_ENDPOINT}:${import.meta.env.VITE_API_PORT}`;
console.log(`apiEndpoint: ${apiEndpoint}`);

export type Account = {
    id: number,
    name: string,
};

export type Budget = {
    id: number,
    name: string,
    categoryIds: Array<number>,
    amount: number,
};

export type Category = {
    id: number,
    name: string,
    parentId: number,
    children: Array<Category>,
    isHidden: boolean,
};

export type Label = {
    id: number,
    name: string,
};

export type TransactionSearchParameter = {
    beginDate: DateTime,
    endDate: DateTime,
    accountIds: Array<number>,
    amount: {
        max: number,
        min: number,
    },
    budgetId: number | null,
    categoryIds: Array<number>,
    query: string,
    showUncategorized: boolean,
    showDuplicated: boolean,
    showHidden: boolean,
};

type TransactionResponse = {
    id: number,
    date: Array<number>,
    description: string,
    account: Account,
    category: Category,
    labels: Array<Label>,
    amount: number,
    isHidden: boolean,
    isPending: boolean,
    isDuplicated: boolean,
};

export type Transaction = {
    id: number,
    date: DateTime,
    description: string,
    account: Account,
    category: Category,
    labels: Array<Label>,
    amount: number,
    isHidden: boolean,
    isPending: boolean,
    isDuplicated: boolean,
    note: string,
};

export async function loadBudgets(): Promise<Array<Budget>> {
    const response = await sendRequest('budgets/list');

    let budgets: Array<Budget> = await response.json();
    budgets.sort(function(a, b) {
        return a.id - b.id;
    });

    const others: Budget = { id: -1, name: 'Others', categoryIds: [], amount: 0};
    const uncategorized: Budget = { id: 0, name: 'Uncategorized', categoryIds: [], amount: 0};

    budgets.push(others);
    budgets.push(uncategorized);

    return budgets;
}

export async function loadCategories(): Promise<Array<Category>> {
    const response = await sendRequest('categories/list');

    let categories: Array<Category> = await response.json();
    categories.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    for (let idx in categories) {
        let category = categories[idx];
        category.isHidden = false;

        for (let childIdx in category.children) {
            let child = category.children[childIdx];
            child.isHidden = false;
        }
    }

    return categories;
}

export async function loadTransactions(params: TransactionSearchParameter): Promise<Array<Transaction>> {
    const urlParams = new URLSearchParams();
    urlParams.append("begin-date", params.beginDate.toFormat('yyyyMMdd'));
    urlParams.append("end-date", params.endDate.toFormat('yyyyMMdd'));

    if (params.accountIds != null && params.accountIds.length > 0) {
        urlParams.append("account-ids", params.accountIds.toString());
    }

    if (params.amount != null && params.amount.min > 0) {
        urlParams.append("amount-min", params.amount.min.toString());
    }

    if (params.amount != null && params.amount.max > 0) {
        urlParams.append("amount-max", params.amount.max.toString());
    }

    if (params.budgetId != null && params.budgetId > 0) {
        urlParams.append("budget-id", params.budgetId.toString());
    } else if (params.budgetId != null && params.budgetId == -1) {
        urlParams.append("budget-id", '-1');
    } else if (params.categoryIds.length > 0) {
        urlParams.append("category-ids", params.categoryIds.toString());
    } else if (params.showUncategorized) {
        urlParams.append("show-uncategorized", 'true');
    }

    if (params.query != null && params.query.length > 0) {
        urlParams.append("query", params.query);
    }

    if (params.showDuplicated) {
        urlParams.append("show-duplicated", 'true');
    }

    if (params.showHidden) {
        urlParams.append("show-hidden", 'true');
    }

    const response = await sendRequest('transactions/list?' + urlParams);
    const transactions = await response.json() as Array<TransactionResponse>;
    return processTransactions(transactions);
}

export async function updateCategory(transactionId: number, categoryId: number): Promise<number> {
    return postForm('transactions/update-category', {
        "id": transactionId,
        "category-id": categoryId
    });
}

export function uploadTransactions(file: File | null, progressHandler: Function): void {
    let xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (evt) => progressHandler(evt), false);
    xhr.open('POST', apiEndpoint + '/api/transactions/upload', true);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.send(file);
}

export async function postForm(url: string, params: Record<string, number | string>): Promise<number> {
    let formData = new FormData();
    
    for (const key in params) {
        formData.append(key, params[key].toString());
    }

    const response = await sendRequest(url, {
        method: 'POST',
        body: formData
    })
    const updated = await response.json() as number;
    return updated;
}

async function sendRequest(path: string, options = {}): Promise<Response> {
    const response = await fetch(apiEndpoint + '/api/' + path, options);

    if (!response.ok) {
        console.log(response);
        throw new Error("Request failed, response code " + response.status);
    }

    return response;
}

function processTransactions(transactions: Array<TransactionResponse>): Array<Transaction> {
    let results: Array<Transaction> = [];
    for (let idx in transactions) {
        const transaction = transactions[idx];

        results[idx] = {
            id: transaction.id,
            date: DateTime.fromObject({
                year: transaction.date[0],
                month: transaction.date[1],
                day: transaction.date[2]
            }),
            description: transaction.description,
            account: transaction.account,
            category: transaction.category,
            labels: transaction.labels,
            amount: transaction.amount,
            isHidden: transaction.isHidden,
            isPending: transaction.isPending,
            isDuplicated: transaction.isDuplicated,
            note: "",
        };
    }

    results.sort(transactionSortFn['date']['desc']);
    return results;
}
