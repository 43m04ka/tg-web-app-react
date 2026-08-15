/**
 * Подсказки для полей карточки, у которых набор значений на практике ограничен,
 * но в схеме это обычные строки: вид, подвид, жанр.
 *
 * Вид и подвид образуют двухуровневый выбор в витрине (сперва вид, потом подвид
 * внутри него), поэтому подвиды дополнительно разложены по видам — чтобы в форме
 * не предлагались варианты из чужой группы.
 */
const uniqueValues = (list, key) => [...new Set(list.map((item) => item[key]).filter(Boolean))];

const buildSuggestions = (cardList = []) => {
    const choiceRowByChoiceColumn = {};
    cardList.forEach((item) => {
        if (!item.choiceColumn || !item.choiceRow) return;
        const bucket = choiceRowByChoiceColumn[item.choiceColumn] || [];
        if (!bucket.includes(item.choiceRow)) bucket.push(item.choiceRow);
        choiceRowByChoiceColumn[item.choiceColumn] = bucket;
    });

    return {
        choiceColumn: uniqueValues(cardList, 'choiceColumn'),
        choiceRow: uniqueValues(cardList, 'choiceRow'),
        genre: uniqueValues(cardList, 'genre'),
        choiceRowBychoiceColumn: choiceRowByChoiceColumn,
    };
};

export default buildSuggestions;
