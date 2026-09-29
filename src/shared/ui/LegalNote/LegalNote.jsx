import React from 'react';

export const PRIVACY_URL = 'https://gwstore.su/pk';
export const OFFER_URL = 'https://gwstore.su/privacy';

export default function LegalNote({action, className}) {
    return (
        <p className={className}>
            Нажимая кнопку «{action}» Вы соглашаетесь с условиями{' '}
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer">Политики конфиденциальности</a>
            {' '}и{' '}
            <a href={OFFER_URL} target="_blank" rel="noreferrer">Пользовательского соглашения (Оферта)</a>
        </p>
    );
}
