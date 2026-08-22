// Тексты-заглушки и подписи типов элементов стартового экрана.
//
// Раньше здесь же лежали decodeStartPageContent/encodeStartPageContent: текст и иконка
// упаковывались в единственное legacy-поле img — то строкой, то data-URL, то JSON.
// У модели давно есть отдельные text/title/icon/color/url, форма пишет в них
// напрямую, и обе функции стали мёртвыми ещё до этого редизайна.

export const START_PAGE_DEFAULTS = {
    title: 'Выберите платформу',
    label: 'У вас будет всегда возможность сменить платформу',
};

export const TYPE_LABELS = {
    title: 'Заголовок',
    label: 'Надпись',
    page: 'Страница',
    link: 'Ссылка',
};
