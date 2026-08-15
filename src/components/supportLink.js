// Контакт менеджера показывается на всех экранах оплаты — касса требует,
// чтобы он был доступен кнопкой, а не только текстом
export const SUPPORT_URL = 'https://t.me/gwstore_admin';

export const openSupport = () => window.open(SUPPORT_URL, '_blank');
