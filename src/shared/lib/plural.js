export const pluralOf = (count, words) => {
    const tens = Math.abs(count) % 100;
    if (tens > 4 && tens < 21) return words[2];

    const ones = tens % 10;
    if (ones === 1) return words[0];
    if (ones > 1 && ones < 5) return words[1];

    return words[2];
};
