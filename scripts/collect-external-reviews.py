import argparse
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import re
import subprocess
import sys
import urllib.parse

from bs4 import BeautifulSoup


SOURCES = [
    {"id": "vk-ps", "platform": "vk", "title": "Геймворд | PlayStation", "url": "https://vk.ru/topic-85243268_49150730?offset=0", "group": 85243268, "topic": 49150730},
    {"id": "vk-xbox", "platform": "vk", "title": "Геймворд | Xbox", "url": "https://vk.ru/topic-217049080_49622703?offset=0", "group": 217049080, "topic": 49622703},
    {"id": "vk-steam", "platform": "vk", "title": "Геймворд | Steam", "url": "https://vk.ru/topic-222135452_50321321?offset=0", "group": 222135452, "topic": 50321321},
    {"id": "tg-ps", "platform": "tg", "title": "Геймворд | PlayStation", "url": "https://t.me/gwstore_reviews/4"},
    {"id": "tg-xbox", "platform": "tg", "title": "Геймворд | Xbox", "url": "https://t.me/gwstore_reviews/3"},
    {"id": "tg-steam", "platform": "tg", "title": "Геймворд | Steam", "url": "https://t.me/gwstore_reviews/12"},
    {"id": "avito", "platform": "avito", "title": "Геймворд", "url": "https://www.avito.ru/brands/i69663676/all?sellerId=5c5cd9b4eb1f9d490410ac0b7faf0fdb"},
]


def download(url, cache, params=None):
    key = hashlib.sha256((url + json.dumps(params, sort_keys=True)).encode()).hexdigest()[:24]
    destination = cache / (key + ".html")
    if destination.exists():
        return destination.read_text(encoding="utf-8")
    command = ["curl.exe", "-L", "--fail", "--max-time", "35", "--silent", "--show-error", "-A", "Mozilla/5.0"]
    if params:
        command += ["--data", urllib.parse.urlencode(params)]
    result = subprocess.run(command + [url], capture_output=True, check=True)
    html = result.stdout.decode("utf-8")
    destination.write_text(html, encoding="utf-8")
    return html


def board_page(source, offset, cache):
    url = f'https://vk.ru/topic-{source["group"]}_{source["topic"]}?offset={offset}'
    html = download(url, cache)
    match = re.search(r"window.cur.apiPrefetchCache\s*=\s*", html)
    if not match:
        raise ValueError(f'{source["id"]}: нет открытого списка отзывов, offset={offset}')
    responses = json.JSONDecoder().raw_decode(html[match.end():])[0]
    entry = next(item for item in responses if item["method"] == "board.getComments")
    if entry["request"]["offset"] != offset:
        raise ValueError("Сайт вернул другую страницу")
    return entry["response"]


def text_of(node):
    for br in node.select("br"):
        br.replace_with("\n")
    return node.get_text().strip()


def collect_vk(source, cache):
    first = board_page(source, 0, cache)
    pages = [first]
    offsets = list(range(20, first["count"], 20))
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for index, page in enumerate(pool.map(lambda offset: board_page(source, offset, cache), offsets)):
            pages.append(page)
            if (index + 1) % 15 == 0:
                print(f'{source["id"]}: {index + 2}/{len(offsets) + 1} страниц', flush=True)
    reviews = []
    seen = set()
    for page in pages:
        names = {row["id"]: " ".join(filter(None, [row.get("first_name"), row.get("last_name")])) for row in page.get("profiles", [])}
        for row in page["items"]:
            text = re.sub(r"\[(?:id|club)[^|]+\|([^\]]+)\]", r"\1", row.get("text", "")).strip()
            if row["from_id"] <= 0 or not text or row["id"] in seen:
                continue
            seen.add(row["id"])
            reviews.append({"id": f'{source["id"]}-{row["id"]}', "sourceId": source["id"], "displayName": names.get(row["from_id"], "Покупатель"), "text": text, "createdAt": datetime.datetime.fromtimestamp(row["date"], datetime.timezone.utc).isoformat(), "rating": 5})
    print(f'{source["id"]}: {len(reviews)} отзывов из {first["count"]} сообщений', flush=True)
    return reviews


def collect_tg(source, cache):
    html = download(source["url"] + "?embed=1&discussion=1", cache)
    document = BeautifulSoup(html, "html.parser")
    auth = re.search(r"TWidgetAuth.init\((\{.*?\})\);", html)
    api_url = json.loads(auth[1])["api_url"]
    form = document.select_one(".js-new_message_form")
    base = {node["name"]: node.get("value", "") for node in form.select("input[name]")}
    reviews = []
    seen = set()
    while True:
        for node in document.select(".js-widget_message[data-post-id]"):
            name = node.select_one(".tgme_widget_message_author > .tgme_widget_message_author_name")
            text = node.select_one(".js-message_text")
            date = node.select_one(".tgme_widget_message_date time")
            identifier = node["data-post-id"]
            if not name or not text or not date or identifier in seen:
                continue
            seen.add(identifier)
            display_name = text_of(name)
            if "Геймворд" in display_name or "GAMEWORLD" in display_name.upper():
                continue
            reviews.append({"id": f'{source["id"]}-{identifier}', "sourceId": source["id"], "displayName": display_name or "Покупатель", "text": text_of(text), "createdAt": date["datetime"], "rating": 5})
        more = document.select_one(".js-messages_more[data-before]")
        if not more:
            break
        before = more["data-before"]
        result = json.loads(download(api_url, cache, {**base, "method": "loadComments", "before_id": before}))
        if result.get("error") or "comments_html" not in result:
            raise ValueError(f'{source["id"]}: Telegram не вернул комментарии')
        document = BeautifulSoup(result["comments_html"], "html.parser")
        next_more = document.select_one(".js-messages_more[data-before]")
        if next_more and next_more["data-before"] == before:
            raise ValueError("Повторилась страница Telegram")
    print(f'{source["id"]}: {len(reviews)} отзывов', flush=True)
    return reviews


def collect_avito(paths):
    months = {"января": 1, "февраля": 2, "марта": 3, "апреля": 4, "мая": 5, "июня": 6, "июля": 7, "августа": 8, "сентября": 9, "октября": 10, "ноября": 11, "декабря": 12}
    reviews = {}
    total = None
    today = datetime.date.today()
    for path in paths:
        document = json.loads(path.read_text(encoding="utf-8"))
        for entry in document.get("entries", []):
            row = entry.get("value", {})
            if entry.get("type") == "score":
                total = row.get("reviewCount")
            if entry.get("type") != "rating":
                continue
            text = "\n".join(section.get("text", "") for section in row.get("textSections", [])).strip()
            if not text:
                continue
            date = re.fullmatch(r"(\d{1,2}) (\S+)(?: (\d{4}))?", row.get("rated", ""))
            if not date or date[2] not in months:
                raise ValueError(f'Не удалось прочитать дату Авито: {row.get("rated")}')
            year = int(date[3]) if date[3] else today.year
            created = datetime.date(year, months[date[2]], int(date[1]))
            if not date[3] and created > today:
                created = created.replace(year=year - 1)
            identifier = f'avito-{row["id"]}'
            reviews[identifier] = {"id": identifier, "sourceId": "avito", "displayName": row.get("title") or "Покупатель", "text": text, "createdAt": created.isoformat(), "rating": 5}
    return list(reviews.values()), total


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache", required=True, type=pathlib.Path)
    parser.add_argument("--output", required=True, type=pathlib.Path)
    parser.add_argument("--avito-json", nargs="*", default=[], type=pathlib.Path)
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    all_reviews = []
    report = []
    for source in SOURCES:
        if source["platform"] == "avito":
            continue
        try:
            rows = collect_vk(source, args.cache) if source["platform"] == "vk" else collect_tg(source, args.cache)
            all_reviews.extend(rows)
            report.append({"sourceId": source["id"], "count": len(rows), "status": "collected"})
        except Exception as error:
            report.append({"sourceId": source["id"], "status": "failed", "error": str(error)})
            print(f'{source["id"]}: {error}', flush=True)
    avito, avito_total = collect_avito(args.avito_json)
    all_reviews.extend(avito)
    report.append({"sourceId": "avito", "count": len(avito), "total": avito_total, "status": "collected" if avito_total == len(avito) else "partial" if avito else "unavailable"})
    all_reviews.sort(key=lambda row: row["createdAt"], reverse=True)
    result = {"collectedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "sources": [{key: value for key, value in source.items() if key not in ("group", "topic")} for source in SOURCES], "reviews": all_reviews, "report": report}
    if not all_reviews:
        raise ValueError("Отзывы не получены")
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"total": len(all_reviews), "report": report}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
