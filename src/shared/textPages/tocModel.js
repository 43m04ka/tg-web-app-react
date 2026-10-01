const NUMBERED = /^\s*(\d{1,3})\s*[.)](?!\d)\s*(\S.*)$/;

export const MIN_TOC_ENTRIES = 2;

export const tocEntries = (blocks) => {
    const headings = (blocks || [])
        .map((block, index) => ({block, index}))
        .filter(({block}) => block?.type === 'heading' && String(block.text || '').trim())
        .map(({block, index}) => {
            const text = String(block.text).trim();
            const match = text.match(NUMBERED);

            return {
                index,
                level: block.level === 3 ? 3 : 2,
                text,
                number: match ? Number(match[1]) : null,
                title: match ? match[2].trim() : text
            };
        });

    const firstNumbered = headings.findIndex((heading) => heading.number !== null);
    const explicit = firstNumbered >= 0;
    const listed = explicit ? headings.slice(firstNumbered) : headings;
    const topLevel = Math.min(...listed.map((heading) => heading.level));
    let counter = 0;

    return listed.map((heading) => {
        const number = explicit
            ? heading.number
            : (heading.level === topLevel ? (counter += 1) : null);

        return {
            id: `section-${heading.index}`,
            blockIndex: heading.index,
            nested: explicit ? heading.number === null : heading.level > topLevel,
            number,
            title: number === null ? heading.text : heading.title
        };
    });
};

export const sectionsCount = (entries) => entries.filter((entry) => !entry.nested).length;

export const hasToc = (blocks) => tocEntries(blocks).length >= MIN_TOC_ENTRIES;

export const sectionNumber = (number) => (number === null || number === undefined ? '' : String(number).padStart(2, '0'));

export const sectionsTitle = (count) => {
    const number = Number(count) || 0;
    const tail = number % 10;
    const hundred = number % 100;

    if (tail === 1 && hundred !== 11) return `${number} раздел`;
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) return `${number} раздела`;

    return `${number} разделов`;
};

export const introLength = (blocks, entries) => (entries.length ? entries[0].blockIndex : (blocks || []).length);
