import type { Transaction } from "./api";

export function formatAmount(amount: number): string {
    let sign = '';
    if (amount < 0) {
        sign = '-';
    }

    return sign + '$' + Math.abs(amount).toFixed(2);
}

export const transactionSortFn: Record<string, Record<string, ((a: Transaction, b: Transaction) => number)>> = {
    "date": {
        "asc": function(a: Transaction, b: Transaction): number {
            if (a.date > b.date) return 1;
            if (a.date < b.date) return -1;
            return 0;
        },
        "desc": function(a: Transaction, b: Transaction): number {
            if (a.date > b.date) return -1;
            if (a.date < b.date) return 1;
            return 0;
        }
    },
    "description": {
        "asc": function(a: Transaction, b: Transaction): number {
            if (a.description > b.description) return 1;
            if (a.description < b.description) return -1;
            return 0;
        },
        "desc": function(a: Transaction, b: Transaction): number {
            if (a.description > b.description) return -1;
            if (a.description < b.description) return 1;
            return 0;
        }
    },
    "category": {
        "asc": function(a: Transaction, b: Transaction): number {
            if (a.category == null && b.category == null) return 0;
            if (a.category == null) return -1;
            if (b.category == null) return 1;
            if (a.category.name > b.category.name) return 1;
            if (a.category.name < b.category.name) return -1;
            return 0;
        },
        "desc": function(a: Transaction, b: Transaction): number {
            if (a.category == null && b.category == null) return 0;
            if (a.category == null) return 1;
            if (b.category == null) return -1;
            if (a.category.name > b.category.name) return -1;
            if (a.category.name < b.category.name) return 1;
            return 0;
        }
    },
    "amount": {
        "asc": function(a: Transaction, b: Transaction): number {
            return a.amount - b.amount;
        },
        "desc": function(a: Transaction, b: Transaction): number {
            return b.amount - a.amount;
        }
    },
};