const WIDTH = 24;
const HEIGHT = 16;

const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;

const circle = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;

const ring = (cx, cy, r, color, width) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"/>`;

const shape = (d, fill) => `<path d="${d}" fill="${fill}"/>`;

const ellipse = (cx, cy, rx, ry, color, width) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-width="${width}"/>`;

const stroke = (d, color, width) =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"/>`;

const bands = (colors) => colors
    .map((fill, index) => rect(0, (HEIGHT / colors.length) * index, WIDTH, HEIGHT / colors.length + 0.03, fill))
    .join('');

const columns = (colors) => colors
    .map((fill, index) => rect((WIDTH / colors.length) * index, 0, WIDTH / colors.length + 0.03, HEIGHT, fill))
    .join('');

const stripedField = (count, first, second) => {
    let body = '';

    for (let index = 0; index < count; index += 1) {
        body += rect(0, (HEIGHT / count) * index, WIDTH, HEIGHT / count + 0.03, index % 2 ? second : first);
    }

    return body;
};

const star = (cx, cy, r, fill, turn = 0) => {
    const points = [];

    for (let index = 0; index < 10; index += 1) {
        const radius = index % 2 ? r * 0.42 : r;
        const angle = (Math.PI / 5) * index - Math.PI / 2 + turn;

        points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
    }

    return `<polygon points="${points.join(' ')}" fill="${fill}"/>`;
};

const crescent = (cx, cy, r, fill, hole) =>
    circle(cx, cy, r, fill) + circle(cx + r * 0.36, cy, r * 0.8, hole);

const nordic = (bg, arm, inner) => {
    const base = rect(0, 0, WIDTH, HEIGHT, bg)
        + rect(6.6, 0, 3.4, HEIGHT, arm)
        + rect(0, 6.3, WIDTH, 3.4, arm);

    if (!inner) return base;

    return base + rect(7.4, 0, 1.8, HEIGHT, inner) + rect(0, 7.1, WIDTH, 1.8, inner);
};

const smallCross = (cx, cy, fill) =>
    rect(cx - 1.15, cy - 0.3, 2.3, 0.6, fill) + rect(cx - 0.3, cy - 1.15, 0.6, 2.3, fill);

const UNION = rect(0, 0, 24, 16, '#012169')
    + stroke('M0 0 24 16M24 0 0 16', '#ffffff', 3.6)
    + stroke('M0 0 24 16M24 0 0 16', '#C8102E', 1.7)
    + rect(0, 5.3, 24, 5.4, '#ffffff')
    + rect(9.3, 0, 5.4, 16, '#ffffff')
    + rect(0, 6.5, 24, 3, '#C8102E')
    + rect(10.5, 0, 3, 16, '#C8102E');

const canton = (id) => `<clipPath id="${id}"><rect width="12" height="8"/></clipPath>`
    + `<g clip-path="url(#${id})"><g transform="scale(0.5)">${UNION}</g></g>`;

const usStripes = () => stripedField(13, '#B31942', '#ffffff');

const usStars = () => {
    let body = '';

    for (let row = 0; row < 4; row += 1) {
        for (let column = 0; column < 5; column += 1) {
            body += circle(1.1 + column * 2.1, 1.1 + row * 2.1, 0.42, '#ffffff');
        }
    }

    return body;
};

const euStars = () => {
    let body = '';

    for (let index = 0; index < 12; index += 1) {
        const angle = (Math.PI / 6) * index;

        body += circle(
            +(12 + 4.6 * Math.sin(angle)).toFixed(2),
            +(8 - 4.6 * Math.cos(angle)).toFixed(2),
            0.72,
            '#FFCC00'
        );
    }

    return body;
};

const FLAGS = [
    {code: 'ru', name: 'Россия', body: bands(['#ffffff', '#0039A6', '#D52B1E'])},
    {
        code: 'kz',
        name: 'Казахстан',
        body: rect(0, 0, 24, 16, '#00AFCA')
            + circle(13, 7.4, 3.1, '#FEC50C')
            + stroke('M4.6 3.4V12.6', '#FEC50C', 1.1)
    },
    {code: 'ua', name: 'Украина', body: bands(['#0057B7', '#FFD700'])},
    {
        code: 'by',
        name: 'Беларусь',
        body: rect(0, 0, 24, 16, '#C8313E')
            + rect(0, 10.6, 24, 5.4, '#4AA657')
            + rect(0, 0, 4.2, 16, '#ffffff')
            + stroke('M2.1 1.4V14.6', '#C8313E', 1.5)
    },
    {
        code: 'md',
        name: 'Молдова',
        body: columns(['#0046AE', '#FFD200', '#CC092F']) + ring(12, 8, 1.9, '#A67C1F', 0.7)
    },
    {code: 'am', name: 'Армения', body: bands(['#D90012', '#0033A0', '#F2A800'])},
    {
        code: 'az',
        name: 'Азербайджан',
        body: bands(['#00B5E2', '#EF3340', '#509E2F'])
            + crescent(10.6, 8, 2.2, '#ffffff', '#EF3340')
            + star(14, 8, 1.2, '#ffffff')
    },
    {
        code: 'ge',
        name: 'Грузия',
        body: rect(0, 0, 24, 16, '#ffffff')
            + rect(10.4, 0, 3.2, 16, '#FF0000')
            + rect(0, 6.4, 24, 3.2, '#FF0000')
            + smallCross(5.2, 3.2, '#FF0000')
            + smallCross(18.4, 3.2, '#FF0000')
            + smallCross(5.2, 12.8, '#FF0000')
            + smallCross(18.4, 12.8, '#FF0000')
    },
    {
        code: 'uz',
        name: 'Узбекистан',
        body: bands(['#0099B5', '#ffffff', '#1EB53A'])
            + crescent(5, 3, 1.8, '#ffffff', '#0099B5')
            + star(8.6, 2.2, 0.7, '#ffffff')
            + star(8.6, 4.2, 0.7, '#ffffff')
            + star(11.2, 2.2, 0.7, '#ffffff')
    },
    {
        code: 'kg',
        name: 'Кыргызстан',
        body: rect(0, 0, 24, 16, '#E8112D')
            + circle(12, 8, 3.2, '#FFEF00')
            + ring(12, 8, 2, '#E8112D', 0.5)
            + stroke('M10 8h4M12 6v4', '#E8112D', 0.5)
    },
    {
        code: 'tr',
        name: 'Турция',
        body: rect(0, 0, 24, 16, '#E30A17')
            + crescent(9.8, 8, 3.1, '#ffffff', '#E30A17')
            + star(14.6, 8, 1.6, '#ffffff')
    },
    {
        code: 'il',
        name: 'Израиль',
        body: rect(0, 0, 24, 16, '#ffffff')
            + rect(0, 2.4, 24, 1.8, '#0038B8')
            + rect(0, 11.8, 24, 1.8, '#0038B8')
            + stroke('M12 4.7 14.7 9.3H9.3z', '#0038B8', 0.8)
            + stroke('M12 11.3 9.3 6.7h5.4z', '#0038B8', 0.8)
    },
    {
        code: 'ae',
        name: 'ОАЭ',
        body: rect(0, 0, 24, 16, '#00732F')
            + rect(0, 5.33, 24, 5.37, '#ffffff')
            + rect(0, 10.67, 24, 5.33, '#000000')
            + rect(0, 0, 6, 16, '#FF0000')
    },
    {
        code: 'kw',
        name: 'Кувейт',
        body: rect(0, 0, 24, 16, '#007A3D')
            + rect(0, 5.33, 24, 5.34, '#ffffff')
            + rect(0, 10.67, 24, 5.33, '#CE1126')
            + shape('M0 0h7.4L5.2 5.33v5.34L7.4 16H0z', '#000000')
    },
    {
        code: 'qa',
        name: 'Катар',
        body: rect(0, 0, 24, 16, '#8A1538')
            + shape('M0 0h6.4l3.1 1.78-3.1 1.78 3.1 1.78-3.1 1.77 3.1 1.78-3.1 1.78'
                + ' 3.1 1.78-3.1 1.78 3.1 1.775H0z', '#ffffff')
    },
    {
        code: 'sa',
        name: 'Саудовская Аравия',
        body: rect(0, 0, 24, 16, '#006C35')
            + rect(5, 5, 14, 1, '#ffffff')
            + rect(5.6, 7, 10.4, 0.9, '#ffffff')
            + rect(5, 10, 14, 0.9, '#ffffff')
            + rect(4, 9.6, 1.1, 1.7, '#ffffff')
    },
    {
        code: 'eg',
        name: 'Египет',
        body: bands(['#CE1126', '#ffffff', '#000000']) + circle(12, 8, 1.5, '#C09300')
    },
    {
        code: 'ma',
        name: 'Марокко',
        body: rect(0, 0, 24, 16, '#C1272D') + star(12, 8, 3.4, '#006233')
    },
    {code: 'ng', name: 'Нигерия', body: columns(['#008751', '#ffffff', '#008751'])},
    {
        code: 'za',
        name: 'ЮАР',
        body: rect(0, 0, 24, 8, '#E03C31')
            + rect(0, 8, 24, 8, '#001489')
            + stroke('M-2 -1 12 8 -2 17M12 8H25', '#ffffff', 5.4)
            + stroke('M-2 -1 12 8 -2 17M12 8H25', '#007A4D', 3)
            + shape('M-1 -1 10.4 8 -1 17z', '#FFB81C')
            + shape('M-1 1.4 7.6 8 -1 14.6z', '#000000')
    },
    {code: 'eu', name: 'Евросоюз', body: rect(0, 0, 24, 16, '#003399') + euStars()},
    {code: 'gb', name: 'Великобритания', body: UNION},
    {code: 'de', name: 'Германия', body: bands(['#000000', '#DD0000', '#FFCE00'])},
    {code: 'fr', name: 'Франция', body: columns(['#0055A4', '#ffffff', '#EF4135'])},
    {code: 'it', name: 'Италия', body: columns(['#008C45', '#ffffff', '#CD212A'])},
    {
        code: 'es',
        name: 'Испания',
        body: rect(0, 0, 24, 16, '#AA151B') + rect(0, 4, 24, 8, '#F1BF00')
    },
    {
        code: 'pt',
        name: 'Португалия',
        body: rect(0, 0, 24, 16, '#FF0000')
            + rect(0, 0, 9.6, 16, '#006600')
            + circle(9.6, 8, 2.9, '#FFE800')
            + circle(9.6, 8, 1.5, '#FF0000')
    },
    {code: 'nl', name: 'Нидерланды', body: bands(['#AE1C28', '#ffffff', '#21468B'])},
    {code: 'be', name: 'Бельгия', body: columns(['#000000', '#FDDA24', '#EF3340'])},
    {code: 'at', name: 'Австрия', body: bands(['#ED2939', '#ffffff', '#ED2939'])},
    {
        code: 'ch',
        name: 'Швейцария',
        body: rect(0, 0, 24, 16, '#D52B1E') + rect(10, 3, 4, 10, '#ffffff') + rect(7, 6, 10, 4, '#ffffff')
    },
    {code: 'pl', name: 'Польша', body: bands(['#ffffff', '#DC143C'])},
    {
        code: 'cz',
        name: 'Чехия',
        body: bands(['#ffffff', '#D7141A']) + shape('M0 0 10.4 8 0 16z', '#11457E')
    },
    {code: 'hu', name: 'Венгрия', body: bands(['#CE2939', '#ffffff', '#477050'])},
    {code: 'ro', name: 'Румыния', body: columns(['#002B7F', '#FCD116', '#CE1126'])},
    {code: 'bg', name: 'Болгария', body: bands(['#ffffff', '#00966E', '#D62612'])},
    {
        code: 'gr',
        name: 'Греция',
        body: stripedField(9, '#0D5EAF', '#ffffff')
            + rect(0, 0, 7.1, 7.1, '#0D5EAF')
            + rect(2.85, 0, 1.4, 7.1, '#ffffff')
            + rect(0, 2.85, 7.1, 1.4, '#ffffff')
    },
    {code: 'se', name: 'Швеция', body: nordic('#006AA7', '#FECC02')},
    {code: 'no', name: 'Норвегия', body: nordic('#BA0C2F', '#ffffff', '#00205B')},
    {code: 'dk', name: 'Дания', body: nordic('#C8102E', '#ffffff')},
    {code: 'fi', name: 'Финляндия', body: nordic('#ffffff', '#003580')},
    {code: 'is', name: 'Исландия', body: nordic('#02529C', '#ffffff', '#DC1E35')},
    {code: 'ie', name: 'Ирландия', body: columns(['#169B62', '#ffffff', '#FF883E'])},
    {code: 'ee', name: 'Эстония', body: bands(['#4891D9', '#000000', '#ffffff'])},
    {code: 'lv', name: 'Латвия', body: bands(['#9E3039', '#ffffff', '#9E3039'])},
    {code: 'lt', name: 'Литва', body: bands(['#FDB913', '#006A44', '#C1272D'])},
    {
        code: 'us',
        name: 'США',
        body: usStripes() + rect(0, 0, 10.6, 8.62, '#0A3161') + usStars()
    },
    {
        code: 'ca',
        name: 'Канада',
        body: rect(0, 0, 24, 16, '#ffffff')
            + rect(0, 0, 6, 16, '#D80621')
            + rect(18, 0, 6, 16, '#D80621')
            + shape('M12 3.2 13.1 6.3 15.7 5.1 14.9 8 17.4 7.8 15.4 9.7 13 9.7 13.5 13 12 12 10.5 13 11 9.7 8.6 9.7 6.6 7.8 9.1 8 8.3 5.1 10.9 6.3z', '#D80621')
    },
    {
        code: 'mx',
        name: 'Мексика',
        body: columns(['#006847', '#ffffff', '#CE1126']) + circle(12, 8, 1.7, '#8A6A3F')
    },
    {
        code: 'br',
        name: 'Бразилия',
        body: rect(0, 0, 24, 16, '#009739')
            + shape('M12 1.4 22.4 8 12 14.6 1.6 8z', '#FEDD00')
            + circle(12, 8, 3.1, '#012169')
            + stroke('M9.1 7.1a3.1 3.1 0 0 0 5.8 1.6', '#ffffff', 0.8)
    },
    {
        code: 'ar',
        name: 'Аргентина',
        body: bands(['#74ACDF', '#ffffff', '#74ACDF']) + circle(12, 8, 1.9, '#F6B40E')
    },
    {
        code: 'cl',
        name: 'Чили',
        body: bands(['#ffffff', '#D52B1E'])
            + rect(0, 0, 8, 8, '#0039A6')
            + star(4, 4, 2.3, '#ffffff')
    },
    {
        code: 'co',
        name: 'Колумбия',
        body: rect(0, 0, 24, 16, '#FCD116') + rect(0, 8, 24, 4, '#003893') + rect(0, 12, 24, 4, '#CE1126')
    },
    {code: 'pe', name: 'Перу', body: columns(['#D91023', '#ffffff', '#D91023'])},
    {
        code: 'in',
        name: 'Индия',
        body: bands(['#FF9933', '#ffffff', '#138808']) + ring(12, 8, 2.1, '#000080', 0.85)
    },
    {
        code: 'pk',
        name: 'Пакистан',
        body: rect(0, 0, 24, 16, '#01411C')
            + rect(0, 0, 6, 16, '#ffffff')
            + crescent(14.6, 8.6, 3, '#ffffff', '#01411C')
            + star(17.6, 5.4, 1.3, '#ffffff')
    },
    {
        code: 'bd',
        name: 'Бангладеш',
        body: rect(0, 0, 24, 16, '#006A4D') + circle(10.6, 8, 4.1, '#F42A41')
    },
    {
        code: 'cn',
        name: 'Китай',
        body: rect(0, 0, 24, 16, '#DE2910')
            + star(5.2, 5, 2.7, '#FFDE00')
            + star(9.6, 2.4, 1, '#FFDE00')
            + star(11.2, 4.4, 1, '#FFDE00')
            + star(11.2, 7, 1, '#FFDE00')
            + star(9.6, 9, 1, '#FFDE00')
    },
    {code: 'jp', name: 'Япония', body: rect(0, 0, 24, 16, '#ffffff') + circle(12, 8, 4.2, '#BC002D')},
    {
        code: 'kr',
        name: 'Южная Корея',
        body: rect(0, 0, 24, 16, '#ffffff')
            + shape('M8.6 8a3.4 3.4 0 0 1 6.8 0z', '#CD2E3A')
            + shape('M8.6 8a3.4 3.4 0 0 0 6.8 0z', '#0047A0')
            + stroke('M3.4 3.8 5.6 6M18.4 3.8 16.2 6M3.4 12.2 5.6 10M18.4 12.2 16.2 10', '#12100B', 0.8)
    },
    {
        code: 'hk',
        name: 'Гонконг',
        body: rect(0, 0, 24, 16, '#DE2910')
            + circle(12, 5.4, 1.5, '#ffffff')
            + circle(14.5, 7.2, 1.5, '#ffffff')
            + circle(13.5, 10.2, 1.5, '#ffffff')
            + circle(10.5, 10.2, 1.5, '#ffffff')
            + circle(9.5, 7.2, 1.5, '#ffffff')
    },
    {
        code: 'tw',
        name: 'Тайвань',
        body: rect(0, 0, 24, 16, '#FE0000')
            + rect(0, 0, 12, 8, '#000095')
            + star(6, 4, 2.6, '#ffffff', 0.31)
            + circle(6, 4, 1.5, '#ffffff')
    },
    {
        code: 'sg',
        name: 'Сингапур',
        body: bands(['#EF3340', '#ffffff'])
            + crescent(5.4, 4, 2.6, '#ffffff', '#EF3340')
            + star(9.4, 2.4, 0.8, '#ffffff')
            + star(11.2, 4, 0.8, '#ffffff')
            + star(9.4, 5.8, 0.8, '#ffffff')
    },
    {
        code: 'my',
        name: 'Малайзия',
        body: stripedField(7, '#CC0001', '#ffffff')
            + rect(0, 0, 12, 9.15, '#010066')
            + crescent(5.2, 4.6, 2.4, '#FFCC00', '#010066')
            + star(9.2, 4.6, 1.3, '#FFCC00')
    },
    {code: 'id', name: 'Индонезия', body: bands(['#CE1126', '#ffffff'])},
    {
        code: 'th',
        name: 'Таиланд',
        body: rect(0, 0, 24, 16, '#A51931')
            + rect(0, 2.67, 24, 10.66, '#ffffff')
            + rect(0, 5.33, 24, 5.34, '#2D2A4A')
    },
    {code: 'vn', name: 'Вьетнам', body: rect(0, 0, 24, 16, '#DA251D') + star(12, 8, 4, '#FFFF00')},
    {
        code: 'ph',
        name: 'Филиппины',
        body: bands(['#0038A8', '#CE1126'])
            + shape('M0 0 9.6 8 0 16z', '#ffffff')
            + circle(3.2, 8, 1.5, '#FCD116')
    },
    {
        code: 'au',
        name: 'Австралия',
        body: rect(0, 0, 24, 16, '#00008B')
            + canton('au-canton')
            + star(6, 12.2, 1.7, '#ffffff')
            + star(18.6, 3.6, 1.2, '#ffffff')
            + star(21, 7.4, 1.1, '#ffffff')
            + star(17.6, 11.2, 1.2, '#ffffff')
            + star(20.4, 12.4, 0.9, '#ffffff')
            + star(19, 8.4, 0.7, '#ffffff')
    },
    {
        code: 'nz',
        name: 'Новая Зеландия',
        body: rect(0, 0, 24, 16, '#00247D')
            + canton('nz-canton')
            + star(19, 3.8, 1.3, '#CC142B')
            + star(21.2, 8, 1.2, '#CC142B')
            + star(17.6, 11.6, 1.2, '#CC142B')
            + star(19.6, 13, 0.9, '#CC142B')
    },
    {
        code: 'global',
        name: 'Глобальный',
        body: rect(0, 0, 24, 16, '#31405B')
            + ring(12, 8, 5, '#ffffff', 0.9)
            + ellipse(12, 8, 2.4, 5, '#ffffff', 0.9)
            + stroke('M7 8h10', '#ffffff', 0.9)
    }
];

const wrap = (body) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">'
    + '<defs><clipPath id="frame"><rect width="24" height="16" rx="2.6"/></clipPath></defs>'
    + `<g clip-path="url(#frame)">${body}</g>`
    + '<rect x="0.3" y="0.3" width="23.4" height="15.4" rx="2.4" fill="none" stroke="rgba(0,0,0,0.18)"'
    + ' stroke-width="0.6"/>'
    + '</svg>';

export const REGION_FLAGS = FLAGS.map(({code, name, body}) => ({
    code,
    name,
    icon: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wrap(body))}`
}));

export const findFlagByIcon = (icon) => REGION_FLAGS.find((flag) => flag.icon === icon) || null;

export const isFlagName = (name) => REGION_FLAGS.some((flag) => flag.name === String(name || '').trim());
