jest.mock('../config/env', () => ({
    DIRECT_API_URL: 'https://gwstore.ru',
    IS_TUNNEL_HOST: true,
    setDirectApi: jest.fn()
}));

const env = require('../config/env');

const answer = (body, ok = true) => Promise.resolve({ok, json: () => Promise.resolve(body)});

const load = () => {
    let mod;
    jest.isolateModules(() => {
        mod = require('./paymentNetwork');
    });
    return mod;
};

beforeEach(() => {
    env.setDirectApi.mockClear();
    global.fetch = jest.fn();
});

describe('checkRussianNetwork', () => {
    it('верит только ответу ru: true', async () => {
        const {checkRussianNetwork} = load();

        global.fetch.mockReturnValueOnce(answer({ru: true}));
        expect(await checkRussianNetwork()).toBe(true);

        global.fetch.mockReturnValueOnce(answer({ru: false}));
        expect(await checkRussianNetwork()).toBe(false);

        global.fetch.mockReturnValueOnce(answer({}, false));
        expect(await checkRussianNetwork()).toBe(false);
    });

    it('недоступный сервер считает включённым VPN', async () => {
        const {checkRussianNetwork} = load();
        global.fetch.mockReturnValueOnce(Promise.reject(new Error('network')));

        expect(await checkRussianNetwork()).toBe(false);
    });
});

describe('refreshNetwork', () => {
    it('российская сеть переключает API на прямой домен', async () => {
        const {refreshNetwork, getNetworkState, NET} = load();
        global.fetch.mockReturnValue(answer({ru: true}));

        expect(await refreshNetwork()).toBe(NET.RU);
        expect(getNetworkState()).toBe(NET.RU);
        expect(env.setDirectApi).toHaveBeenLastCalledWith(true);
    });

    it('включённый VPN возвращает API на gwstorebot.ru и оповещает подписчиков', async () => {
        const {refreshNetwork, subscribeNetwork, wasForeignSeen, NET} = load();
        const listener = jest.fn();
        subscribeNetwork(listener);

        global.fetch.mockReturnValueOnce(answer({ru: true}));
        await refreshNetwork();

        global.fetch.mockReturnValueOnce(answer({ru: false}));
        expect(await refreshNetwork()).toBe(NET.FOREIGN);

        expect(env.setDirectApi).toHaveBeenLastCalledWith(false);
        expect(listener).toHaveBeenLastCalledWith(NET.FOREIGN);
        expect(wasForeignSeen()).toBe(true);
    });

    it('одновременные проверки делают один запрос', async () => {
        const {refreshNetwork} = load();
        global.fetch.mockReturnValue(answer({ru: true}));

        await Promise.all([refreshNetwork(), refreshNetwork(), refreshNetwork()]);

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});

describe('reportDirectFailure', () => {
    it('сбой прямого домена сразу уводит запросы на gwstorebot.ru', async () => {
        const {refreshNetwork, reportDirectFailure, getNetworkState, NET} = load();

        global.fetch.mockReturnValueOnce(answer({ru: true}));
        await refreshNetwork();

        global.fetch.mockReturnValue(answer({ru: false}));
        reportDirectFailure();

        expect(getNetworkState()).toBe(NET.FOREIGN);
        expect(env.setDirectApi).toHaveBeenLastCalledWith(false);
    });
});

describe('ensurePaymentNetwork', () => {
    it('в российской сети пускает к оплате', async () => {
        const {ensurePaymentNetwork} = load();
        global.fetch.mockReturnValue(answer({ru: true}));

        expect(await ensurePaymentNetwork()).toBe(true);
    });

    it('под VPN не пускает к оплате', async () => {
        const {ensurePaymentNetwork} = load();
        global.fetch.mockReturnValue(answer({ru: false}));

        expect(await ensurePaymentNetwork()).toBe(false);
    });

    it('проверяет сеть перед каждой оплатой', async () => {
        const {ensurePaymentNetwork} = load();

        global.fetch.mockReturnValueOnce(answer({ru: true}));
        expect(await ensurePaymentNetwork()).toBe(true);

        global.fetch.mockReturnValueOnce(answer({ru: false}));
        expect(await ensurePaymentNetwork()).toBe(false);
    });
});
