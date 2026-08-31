const keyOf = (product, group) => [
    group ?? '',
    String(product.name || '').trim().toLowerCase(),
    product.price ?? '',
    product.regionActivate ?? '',
    product.choiceRow ?? '',
    product.choiceColumn ?? ''
].join('|');

export function dedupeProducts(items, groupOf) {
    if (!Array.isArray(items) || items.length === 0) return items;

    const seen = new Set();

    return items.filter((product) => {
        if (!product) return false;

        const key = keyOf(product, groupOf?.(product));
        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
}
