import React from 'react';
import {useTextPageLinks} from '../../textPages/useTextPages';
import {textPageRoute} from '../../textPages/textPageModel';

export const PRIVACY_URL = '/info/privacy';
export const OFFER_URL = '/info/terms';

export default function LegalNote({action, className}) {
    const pages = useTextPageLinks();
    const returns = pages.find((page) => /возврат/i.test(page.title));
    return (
        <p className={className}>
            Нажимая кнопку «{action}» Вы соглашаетесь с условиями{' '}
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer">Политики конфиденциальности</a>
            {', '}
            <a href={OFFER_URL} target="_blank" rel="noreferrer">Пользовательского соглашения</a>
            {', '}
            {returns ? <a href={textPageRoute(returns)} target="_blank" rel="noreferrer">Политики возвратов</a> : 'Политики возвратов'}
        </p>
    );
}
