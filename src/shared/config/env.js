// Домен зашит намеренно. Сборка уезжает и на прод, и на тестовый стенд Cloudflare,
// а данные у них общие — стенд ходит в тот же сервер. Переменная окружения только
// давала шанс собрать билд с пустым API и заметить это уже в боте.
export const DIRECT_API_URL = 'https://gwstore.ru';
export const TUNNEL_API_URL = 'https://gwstorebot.ru';

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

// gwstorebot.ru открывается через зарубежный маршрут, чтобы витрина грузилась и под VPN.
// Кассы же принимают оплату только из российской сети
export const IS_TUNNEL_HOST = hostname === 'gwstorebot.ru' || hostname === 'www.gwstorebot.ru';

export let API_BASE_URL = hostname === 'gwstore.ru' || hostname === 'www.gwstore.ru'
    ? DIRECT_API_URL
    : TUNNEL_API_URL;

export const setDirectApi = (isDirect) => {
    if (!IS_TUNNEL_HOST) return;
    API_BASE_URL = isDirect ? DIRECT_API_URL : TUNNEL_API_URL;
};

export const GUEST_USER = {
    id: 5106439090,
    first_name: 'Гость',
    last_name: ''
};

export const BOOTSTRAP_TIMEOUT_MS = 6000;
