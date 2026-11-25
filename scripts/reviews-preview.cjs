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
let reviews = examples.slice(0, 3).map(([displayName, text, name, rating], index) => ({id: `demo-${index}`, displayName, text, rating,
    purchasedAt: `2026-10-${28 - index}T12:00:00Z`, createdAt: '2026-10-30T09:00:00Z', verified: true,
    items: [{name, quantity: 1}], photos: []}));
let submitted = false;
let invitations = 0;
let simulatedMessages = 0;
let failReviewList = false;
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
        const context = await browser.newContext({viewport: {width: 1440, height: 1400}, locale: 'ru-RU', colorScheme: 'dark', reducedMotion: 'reduce'});
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
            else if (p === '/api/review') {
                if (failReviewList) return route.fulfill({status: 503, json: {error: 'Отзывы сайта временно недоступны'}});
                data = {items: reviews, count: reviews.length, average: Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)), hasMore: false};
            }
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
        await page.getByRole('heading', {name: 'Отзывы клиентов', exact: true}).waitFor();
        await page.getByText('Александр', {exact: false}).waitFor();
        const external = page.locator('section[aria-labelledby="external-reviews-title"]');
        await external.locator('a[target="_blank"]').first().waitFor();
        assert.equal(await page.getByText('Опыт наших покупателей', {exact: true}).count(), 0);
        const score = page.locator('[class*="Reviews_score__"]').first();
        const assertScore = async () => {
            const positions = await score.locator(':scope > *').evaluateAll((nodes) => nodes.map((node) => {
                const box = node.getBoundingClientRect();
                return box.top + box.height / 2;
            }));
            assert.ok(Math.max(...positions) - Math.min(...positions) < 3);
            assert.equal(await score.locator('[class*="scoreStars"]').evaluate((node) => getComputedStyle(node).color), 'rgb(245, 180, 59)');
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
        };
        await assertScore();
        const iconLayout = await external.locator('[data-platform]').evaluateAll((nodes) => nodes.map((node) => {
            const wrapper = node.getBoundingClientRect();
            const image = node.querySelector('svg, img');
            const box = image.getBoundingClientRect();
            return {platform: node.dataset.platform, dx: Math.abs((wrapper.left + wrapper.right - box.left - box.right) / 2), dy: Math.abs((wrapper.top + wrapper.bottom - box.top - box.bottom) / 2), loaded: image.tagName.toLowerCase() !== 'img' || (image.complete && image.naturalWidth > 0)};
        }));
        assert.ok(iconLayout.length > 0 && iconLayout.every((icon) => icon.dx < .1 && icon.dy < .1 && icon.loaded));
        const iconClip = await external.locator('[class*="filters"]').evaluate((node) => {
            const boxes = Array.from(node.children, (child) => child.getBoundingClientRect());
            const x = Math.min(...boxes.map((box) => box.left));
            const y = Math.min(...boxes.map((box) => box.top));
            return {x, y, width: Math.max(...boxes.map((box) => box.right)) - x, height: Math.max(...boxes.map((box) => box.bottom)) - y};
        });
        await page.screenshot({path: path.join(output, 'review-platform-icons.png'), clip: iconClip, animations: 'disabled'});
        assert.equal(await external.locator('a[class*="externalCard"]').count(), 12);
        await external.getByRole('button', {name: 'Показать ещё', exact: true}).click();
        assert.equal(await external.locator('a[class*="externalCard"]').count(), 24);
        await external.getByRole('button', {name: 'Авито', exact: true}).click();
        assert.equal(await external.locator('a[class*="externalCard"]').count(), 12);
        const avitoLinks = await external.locator('a[class*="externalCard"]').evaluateAll((nodes) => nodes.map((node) => node.href));
        assert.ok(avitoLinks.every((url) => url === 'https://www.avito.ru/brands/i69663676/all?sellerId=5c5cd9b4eb1f9d490410ac0b7faf0fdb'));
        await page.screenshot({path: path.join(output, 'reviews-avito-desktop.png'), fullPage: true, animations: 'disabled'});
        await external.getByRole('button', {name: 'Все площадки', exact: true}).click();
        const dates = await external.locator('time').evaluateAll((nodes) => nodes.map((node) => Date.parse(node.dateTime)));
        assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
        await page.screenshot({path: path.join(output, 'reviews-desktop.png'), fullPage: true, animations: 'disabled'});
        await page.setViewportSize({width: 390, height: 844});
        await page.reload();
        await page.getByText('Александр', {exact: false}).waitFor();
        await assertScore();
        const mobileScroll = await page.locator('section').filter({has: page.getByRole('heading', {name: 'Отзывы клиентов', exact: true})}).evaluate((node) => {
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
        for (const width of [320, 360, 768]) {
            await page.setViewportSize({width, height: 900});
            await assertScore();
        }
        await page.goto(origin + `/reviews/write#token=${token}`);
        assert.equal(await page.getByRole('radio', {name: '5 из 5', exact: true}).getAttribute('aria-checked'), 'true');
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
        failReviewList = true;
        await page.goto(origin + '/reviews');
        await page.getByRole('alert').filter({hasText: 'Отзывы сайта временно недоступны'}).waitFor();
        await external.locator('a[class*="externalCard"]').first().waitFor();
        for (const [platform, hostname] of [['ВКонтакте', 'vk.ru'], ['Telegram', 't.me']]) {
            await external.getByRole('button', {name: platform, exact: true}).click();
            const links = await external.locator('a[class*="externalCard"]').evaluateAll((nodes) => nodes.map((node) => ({url: node.href, target: node.target})));
            assert.ok(links.length > 0 && links.every((link) => new URL(link.url).hostname === hostname && link.target === '_blank'));
        }
        assert.deepEqual(errors, []);
        const report = {screenshots: 7, iconsCentered: true, widthsChecked: [320, 360, 390, 768, 1440], externalFiltersChecked: ['vk', 'tg', 'avito'], siteFailureKeepsExternalReviews: true, formSubmitted: submitted, invitationRequests: invitations,
            simulatedTelegramMessages: simulatedMessages, siteReviewsAreFixtures: true, externalReviewsAreCollected: true, realExternalRequests: 0, browserErrors: errors};
        fs.writeFileSync(path.join(output, 'browser-check.json'), JSON.stringify(report, null, 2));
        console.log(JSON.stringify(report));
    } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }
}

main().catch((error) => { console.error(error); server.close(); process.exitCode = 1; });
