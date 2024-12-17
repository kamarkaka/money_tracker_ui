import type { Category } from "./api";

export function searchCategory(categories: Array<Category>, categoryQuery: string): Array<Category> {
    for (let idx in categories) {
        let category = categories[idx];

        let isHidden = true;
        for (let childIdx in category.children) {
            let child = category.children[childIdx];

            if (child.name.toLowerCase().includes(categoryQuery.toLowerCase())) {
                child.isHidden = false;
                if (isHidden) isHidden = false;
            } else {
                child.isHidden = true;
            }
        }

        if (category.name.toLowerCase().includes(categoryQuery.toLowerCase())) {
            isHidden = false;
        }

        category.isHidden = isHidden;
    }

    return categories;
}
