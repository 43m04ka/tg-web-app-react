const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(process.argv[2]);

const output = path.resolve(process.argv[3]);
fs.mkdirSync(output, {recursive: true});
const build = path.resolve(__dirname, '..', process.env.REVIEWS_BUILD_DIR || 'build-reviews-checked');
const token = 'a'.repeat(43);
const order = {id: 1042, userId: 1, type: 'catalog', platform: 'tg', status: 'paid', total: 3490,
    itemsTotal: 3490, discount: 0, paymentMethod: 'sbp', paymentTitle: 'СБП', paymentProvider: 'paykeeper',
    pageTitle: 'PlayStation', pageType: 'ps', contact: '@test_customer', createdAt: '2026-10-28T12:00:00Z'};
const items = [{name: 'PlayStation Plus Essential — 12 месяцев', quantity: 1}];
const positions = [{id: 1, ...items[0], price: 3490, sum: 3490}];
const examples = [
    ['Александр', 'Подписку оформили быстро. Менеджер помог разобраться с активацией. Спасибо за работу!', 'PlayStation Plus Essential — 12 месяцев', 5],
    ['Мария', 'Всё понятно и удобно. Баланс Steam пополнили за пару минут, уже выбираю новую игру.', 'Пополнение Steam', 5],
    ['Дмитрий', 'Код пришёл сразу после оплаты, активировался с первого раза. Буду обращаться ещё.', 'Xbox Game Pass Ultimate — 3 месяца', 5],
    ['Никита', 'Хороший сервис, всё получилось. В этот раз немного подождал ответа менеджера.', 'PlayStation Store — пополнение кошелька', 4],
    ['Анна', 'Покупаю здесь второй раз. Помогли подобрать нужную подписку, всё работает.', 'EA Play — 12 месяцев', 5],
    ['Владислав', 'Быстро и без лишних действий. Удобно, что все заказы сохраняются в аккаунте.', 'Оплата зарубежного сервиса', 5],
];
let reviews = examples.map(([displayName, text, name, rating], index) => ({id: `demo-${index}`, displayName, text, rating,
    purchasedAt: `2026-10-${28 - index}T12:00:00Z`, createdAt: '2026-10-30T09:00:00Z', verified: true,
    items: [{name, quantity: 1}], photos: []}));
let submitted = false;
let invitations = 0;
let simulatedMessages = 0;
const errors = [];

const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const resolved = path.resolve(build, '.' + pathname);
    const file = resolved.startsWith(build + path.sep) && fs.existsSync(resolved) && fs.statSync(resolved).isFile()
        ? resolved : path.join(build, 'index.html');
    const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2'};
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
});

async function main() {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-proxy-server']});
    try {
        const context = await browser.newContext({viewport: {width: 1440, height: 1100}, locale: 'ru-RU', colorScheme: 'dark', reducedMotion: 'reduce'});
        await context.addInitScript(() => {
            window.localStorage.setItem('cookie:accepted', '1');
            window.localStorage.setItem('admin2.session', JSON.stringify({token: 'local-preview-only', name: 'Менеджер'}));
            window.__INITIAL_DATA__ = {pages: [{id: 1, name: 'PlayStation', type: 'ps', isHidden: false}],
                startPages: [{id: 1, name: 'PlayStation', structurePageId: 1, platform: 'web'}],
                catalogs: [], structureBlocks: [], popularProducts: [], banners: []};
        });
        await context.route('**/*', async (route) => {
            const url = new URL(route.request().url());
            if (url.origin === origin) return route.continue();
            if (!['gwstorebot.ru', 'gwstore.ru', 'www.gwstorebot.ru', 'www.gwstore.ru'].includes(url.hostname)) return route.abort();
            const p = url.pathname;
            let data = {result: []};
            if (p === '/api/auth/session') data = {ok: true, token: 'local-preview-user', user: {id: 1, kind: 'user', username: 'Тестовый покупатель'}};
            else if (p === '/api/admin/settings/public') data = {result: {maintenance_mode: false}};
            else if (p === '/api/structure/allPages') data = {result: [{id: 1, name: 'PlayStation', type: 'ps', isHidden: false}]};
            else if (p === '/api/structure/allStartPages') data = {result: [{id: 1, name: 'PlayStation', structurePageId: 1, platform: 'web'}]};
            else if (p === '/api/review') data = {items: reviews, count: reviews.length, average: Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)), hasMore: false};
            else if (p === '/api/review/mine') data = {items: [{id: order.id, purchasedAt: order.createdAt, items, review: submitted ? {id: 'new', rating: 5} : null}]};
            else if (p === '/api/review/invitation' || p === '/api/review/form/1042') data = {order: {id: order.id, purchasedAt: order.createdAt, items}, displayName: 'Тестовый покупатель', documents: [{url: '/info/pk'}, {url: '/info/privacy'}]};
            else if (p === '/api/review/invitation/submit' || p === '/api/review/submit') {
                assert.match(route.request().postDataBuffer().toString(), /consent/);
                submitted = true;
                reviews = [{id: 'new', displayName: 'Тестовый покупатель', purchasedAt: order.createdAt, rating: 5, text: 'Спасибо! Всё быстро и понятно.', items, photos: []}, ...reviews];
                return route.fulfill({status: 201, json: {id: 'new'}});
            } else if (p === '/api/admin/getOrderData') data = {order, result: positions, user: {username: 'Тестовый покупатель', chatId: '12345'}, codes: []};
            else if (p === '/api/admin/orders') data = {items: [order], total: 1, page: 1, pageSize: 30};
            else if (p === '/api/admin/order/review-link') {
                invitations++;
                const input = route.request().postDataJSON();
                if (input.send) simulatedMessages++;
                data = {url: `https://gwstorebot.ru/reviews/write#token=${token}`, expiresAt: '2026-11-29', sent: Boolean(input.send)};
            }
            return route.fulfill({json: data});
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin + '/reviews');
        await page.getByRole('heading', {name: 'Отзывы', exact: true}).waitFor();
        await page.getByText('Александр', {exact: false}).waitFor();
        await page.screenshot({path: path.join(output, 'reviews-desktop.png'), fullPage: true, animations: 'disabled'});
        await page.setViewportSize({width: 390, height: 844});
        await page.reload();
        await page.getByText('Александр', {exact: false}).waitFor();
        const mobileScroll = await page.locator('section').filter({has: page.getByRole('heading', {name: 'Отзывы', exact: true})}).evaluate((node) => {
            const before = node.scrollTop;
            node.scrollTop = node.scrollHeight;
            const scrolled = node.scrollTop > before;
            node.scrollTop = 0;
            return scrolled;
        });
        assert.equal(mobileScroll, true);
        await page.setViewportSize({width: 390, height: 2400});
        await page.screenshot({path: path.join(output, 'reviews-mobile.png'), fullPage: true, animations: 'disabled'});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
        await page.goto(origin + `/reviews/write#token=${token}`);
        await page.getByLabel('Ваш отзыв').fill('Спасибо! Всё быстро и понятно.');
        await page.getByRole('radio', {name: '5 из 5', exact: true}).click();
        assert.equal(await page.getByRole('button', {name: 'Опубликовать отзыв'}).isDisabled(), true);
        await page.getByRole('checkbox').nth(0).check();
        assert.equal(await page.getByRole('button', {name: 'Опубликовать отзыв'}).isDisabled(), true);
        await page.getByRole('checkbox').nth(1).check();
        await page.setViewportSize({width: 390, height: 1600});
        await page.screenshot({path: path.join(output, 'review-form-mobile.png'), fullPage: true, animations: 'disabled'});
        await page.getByRole('button', {name: 'Опубликовать отзыв'}).click();
        await page.getByRole('heading', {name: 'Спасибо за ваш отзыв!'}).waitFor();
        await page.goto(origin + '/reviews?mine=1');
        await page.getByText('✓ Отзыв оставлен · 5 из 5').waitFor();
        await page.screenshot({path: path.join(output, 'review-account-mobile.png'), fullPage: true});
        await page.setViewportSize({width: 1440, height: 1100});
        await page.goto(origin + '/admin/orders/1042');
        await page.getByRole('button', {name: 'Скопировать ссылку на отзыв', exact: true}).click();
        await page.getByLabel('Персональная ссылка на отзыв').waitFor();
        await page.screenshot({path: path.join(output, 'review-admin-desktop.png'), fullPage: true});
        await page.getByRole('button', {name: 'Отправить ссылку на отзыв', exact: true}).click();
        const confirm = page.getByRole('dialog');
        await confirm.getByRole('button', {name: 'Отправить', exact: true}).click();
        await page.getByText('Ссылка отправлена покупателю', {exact: true}).waitFor();
        assert.equal(invitations, 2);
        assert.equal(simulatedMessages, 1);
        assert.deepEqual(errors, []);
        const report = {screenshots: 5, formSubmitted: submitted, invitationRequests: invitations,
            simulatedTelegramMessages: simulatedMessages, realExternalRequests: 0, browserErrors: errors};
        fs.writeFileSync(path.join(output, 'browser-check.json'), JSON.stringify(report, null, 2));
        console.log(JSON.stringify(report));
    } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
}

main().catch((error) => { console.error(error); server.close(); process.exitCode = 1; });
