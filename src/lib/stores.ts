import type { Transaction } from "./api";

export type CateogrySelectorOptions = {
    show: boolean,
    position: {
        top: number,
        left: number
    }
};
export const defaultCSO: CateogrySelectorOptions = {
    show: false,
    position: {
        top: 0,
        left: 0
    }
};

export type TransactionSortOptions = {
    field: string,
    order: 'asc' | 'desc'
};
export const defaultTSO: TransactionSortOptions = {
    field: 'date',
    order: 'asc'
};

export type TransactionDetailOptions = {
    show: boolean,
    transaction: Transaction | null
};
export const defaultTDO: TransactionDetailOptions = {
    show: false,
    transaction: null
};

export type PaginationOptions = {
    total: number,
    limit: number,
    offset: number
};
export const defaultPO: PaginationOptions = {
    total: 0,
    limit: 20,
    offset: 0,
};
