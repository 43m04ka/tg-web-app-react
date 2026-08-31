// Домен зашит намеренно. Сборка уезжает и на прод, и на тестовый стенд Cloudflare,
// а данные у них общие — стенд ходит в тот же сервер. Переменная окружения только
// давала шанс собрать билд с пустым API и заметить это уже в боте.
export const API_BASE_URL = 'https://gwstorebot.ru';

export const GUEST_USER = {
    id: 5106439090,
    first_name: 'Гость',
    last_name: ''
};

export const BOOTSTRAP_TIMEOUT_MS = 6000;
