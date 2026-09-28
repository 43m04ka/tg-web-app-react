jest.mock('../config/env', () => ({
    DIRECT_API_URL: 'https://gwstore.ru',
    IS_TUNNEL_HOST: true,
    switchToDirectApi: jest.fn()
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
    env.switchToDirectApi.mockClear();
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

describe('ensurePaymentNetwork', () => {
    it('в российской сети сразу пускает и переключает API на прямой домен', async () => {
        const {ensurePaymentNetwork} = load();
        global.fetch.mockReturnValue(answer({ru: true}));

        expect(await ensurePaymentNetwork()).toBe(true);
        expect(env.switchToDirectApi).toHaveBeenCalledTimes(1);
    });

    it('под VPN ждёт окно и пускает после подтверждения', async () => {
        const {ensurePaymentNetwork, subscribePaymentGate} = load();
        global.fetch.mockReturnValue(answer({ru: false}));
        subscribePaymentGate(({resolve}) => resolve(true));

        expect(await ensurePaymentNetwork()).toBe(true);
        expect(env.switchToDirectApi).toHaveBeenCalledTimes(1);
    });

    it('отмена в окне не пускает к оплате', async () => {
        const {ensurePaymentNetwork, subscribePaymentGate} = load();
        global.fetch.mockReturnValue(answer({ru: false}));
        subscribePaymentGate(({resolve}) => resolve(false));

        expect(await ensurePaymentNetwork()).toBe(false);
        expect(env.switchToDirectApi).not.toHaveBeenCalled();
    });
});
