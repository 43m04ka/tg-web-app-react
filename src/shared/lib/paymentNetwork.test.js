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

describe('checkNetwork', () => {
    it('российская сеть только при ru: true, страну передаёт дальше', async () => {
        const {checkNetwork} = load();

        global.fetch.mockReturnValueOnce(answer({country: 'RU', ru: true}));
        expect(await checkNetwork()).toEqual({isRu: true, code: 'RU'});

        global.fetch.mockReturnValueOnce(answer({country: 'NL', ru: false}));
        expect(await checkNetwork()).toEqual({isRu: false, code: 'NL'});

        global.fetch.mockReturnValueOnce(answer({}, false));
        expect(await checkNetwork()).toEqual({isRu: false, code: null});
    });

    it('недоступный сервер считает зарубежной сетью без страны', async () => {
        const {checkNetwork} = load();
        global.fetch.mockReturnValueOnce(Promise.reject(new Error('network')));

        expect(await checkNetwork()).toEqual({isRu: false, code: null});
    });
});

describe('refreshNetwork', () => {
    it('российская сеть переключает API на прямой домен', async () => {
        const {refreshNetwork, getNetwork, NET} = load();
        global.fetch.mockReturnValue(answer({country: 'RU', ru: true}));

        expect(await refreshNetwork()).toBe(NET.RU);
        expect(getNetwork()).toEqual({state: NET.RU, country: 'RU'});
        expect(env.setDirectApi).toHaveBeenLastCalledWith(true);
    });

    it('зарубежная сеть возвращает API на gwstorebot.ru и оповещает подписчиков', async () => {
        const {refreshNetwork, subscribeNetwork, NET} = load();
        const listener = jest.fn();
        subscribeNetwork(listener);

        global.fetch.mockReturnValueOnce(answer({country: 'RU', ru: true}));
        await refreshNetwork();

        global.fetch.mockReturnValueOnce(answer({country: 'DE', ru: false}));
        expect(await refreshNetwork()).toBe(NET.FOREIGN);

        expect(env.setDirectApi).toHaveBeenLastCalledWith(false);
        expect(listener).toHaveBeenLastCalledWith({state: NET.FOREIGN, country: 'DE'});
    });

    it('одновременные проверки делают один запрос', async () => {
        const {refreshNetwork} = load();
        global.fetch.mockReturnValue(answer({country: 'RU', ru: true}));

        await Promise.all([refreshNetwork(), refreshNetwork(), refreshNetwork()]);

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});

describe('isVpnSuspected', () => {
    it('не предупреждает в России и СНГ, предупреждает в остальных случаях', () => {
        const {isVpnSuspected, NET} = load();

        expect(isVpnSuspected({state: NET.RU, country: 'RU'})).toBe(false);
        expect(isVpnSuspected({state: NET.FOREIGN, country: 'KZ'})).toBe(false);
        expect(isVpnSuspected({state: NET.FOREIGN, country: 'BY'})).toBe(false);
        expect(isVpnSuspected({state: NET.CHECKING, country: null})).toBe(false);
        expect(isVpnSuspected({state: NET.FOREIGN, country: 'NL'})).toBe(true);
        expect(isVpnSuspected({state: NET.FOREIGN, country: null})).toBe(true);
    });
});

describe('reportDirectFailure', () => {
    it('сбой прямого домена сразу уводит запросы на gwstorebot.ru', async () => {
        const {refreshNetwork, reportDirectFailure, getNetwork, NET} = load();

        global.fetch.mockReturnValueOnce(answer({country: 'RU', ru: true}));
        await refreshNetwork();

        global.fetch.mockReturnValue(answer({country: 'NL', ru: false}));
        reportDirectFailure();

        expect(getNetwork().state).toBe(NET.FOREIGN);
        expect(env.setDirectApi).toHaveBeenLastCalledWith(false);
    });
});

describe('preparePaymentNetwork', () => {
    it('перед оплатой обновляет маршрут, но оплату не блокирует', async () => {
        const {preparePaymentNetwork, getNetwork, NET} = load();

        global.fetch.mockReturnValueOnce(answer({country: 'NL', ru: false}));
        await expect(preparePaymentNetwork()).resolves.toBeUndefined();
        expect(getNetwork().state).toBe(NET.FOREIGN);

        global.fetch.mockReturnValueOnce(answer({country: 'RU', ru: true}));
        await preparePaymentNetwork();
        expect(getNetwork().state).toBe(NET.RU);
        expect(env.setDirectApi).toHaveBeenLastCalledWith(true);
    });
});
