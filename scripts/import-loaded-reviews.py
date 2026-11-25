import argparse
import collections
import datetime
import hashlib
import json
import pathlib
import re


MOSCOW = datetime.timezone(datetime.timedelta(hours=3))
MONTHS = {"янв": 1, "фев": 2, "мар": 3, "апр": 4, "мая": 5, "май": 5, "июн": 6, "июл": 7, "авг": 8, "сен": 9, "окт": 10, "ноя": 11, "дек": 12}
TODAY = datetime.date(2026, 11, 2)


def clean_lines(text):
    return [line.strip() for line in text.replace("\ufffc", "").replace("\u00a0", " ").splitlines() if line.strip()]


def date_of(value):
    relative = re.fullmatch(r"(сегодня|вчера)(?: в (\d{1,2}):(\d{2}))?", value, re.I)
    if relative:
        day = TODAY - datetime.timedelta(days=relative[1].lower() == "вчера")
        return datetime.datetime.combine(day, datetime.time(int(relative[2] or 0), int(relative[3] or 0)), MOSCOW).isoformat()
    match = re.fullmatch(r"(\d{1,2}) ([а-я]+)\.?(?: (\d{4}))?(?: в (\d{1,2}):(\d{2}))?", value, re.I)
    if not match:
        raise ValueError(f"Неизвестная дата: {value}")
    month = MONTHS.get(match[2][:3].lower())
    if not month:
        raise ValueError(f"Неизвестный месяц: {value}")
    year = int(match[3] or TODAY.year)
    day = datetime.date(year, month, int(match[1]))
    if not match[3] and day > TODAY:
        day = day.replace(year=year - 1)
    if match[4]:
        return datetime.datetime.combine(day, datetime.time(int(match[4]), int(match[5])), MOSCOW).isoformat()
    return day.isoformat()


def make_id(source, name, created, text, occurrence=0):
    value = "\0".join([source, name, created, text, str(occurrence)])
    return source + "-" + hashlib.sha256(value.encode()).hexdigest()[:20]


def avito_reviews(path, existing):
    original = path.read_text(encoding="utf-8")
    lines = clean_lines(original)
    headers = [(index, re.fullmatch(r"(\d{1,2} [а-я]+(?: \d{4})?) · (Покупатель|Продавец|Клиент)", line)) for index, line in enumerate(lines)]
    headers = [(index, match) for index, match in headers if match]
    old = collections.defaultdict(list)
    for row in existing:
        if row["sourceId"] == "avito":
            old[(row["displayName"], row["createdAt"][:10])].append(row)
    used = set()
    rows = []
    for position, (index, match) in enumerate(headers):
        name = lines[index - 1]
        end = headers[position + 1][0] - 1 if position + 1 < len(headers) else len(lines)
        body = lines[index + 1:end]
        owner = next((offset for offset, line in enumerate(body) if line == "Геймворд | Игровой дискаунтер"), len(body))
        body = body[:owner]
        status = body.pop(0) if body and re.match(r"^(Сделка |Не договорились|Не общались)", body[0]) else None
        body = [line for line in body if not line.startswith("Показать целиком") and line != "Отзывы без оценки" and line != "..."]
        body = [line[3:] if line.startswith("...") else line for line in body]
        text = "\n".join(body).strip()
        created = date_of(match[1])
        previous = next((row for row in old[(name, created[:10])] if row["id"] not in used), None)
        if previous:
            identifier = previous["id"]
            text = previous["text"]
            used.add(identifier)
        else:
            identifier = make_id("avito", name, created, text, position)
        row = {"id": identifier, "sourceId": "avito", "displayName": name, "text": text, "createdAt": created, "rating": 5}
        if status:
            row["transactionStatus"] = status
        rows.append(row)
    if len(rows) != 757:
        raise ValueError(f"Ожидалось 757 записей Авито, получено {len(rows)}")
    return rows


def vk_reviews(path, source):
    original = path.read_text(encoding="utf-8")
    lines = clean_lines(original)
    lines = lines[lines.index("Сначала новые") + 1:]
    chunks = []
    current = []
    for line in lines:
        if line == "Ответить":
            chunks.append(current)
            current = []
        else:
            current.append(line)
    rows = []
    for chunk in chunks:
        if not chunk or chunk[0].startswith("Геймворд |"):
            continue
        name = chunk[0]
        created = date_of(chunk[-1])
        body = [line for line in chunk[1:-1] if line != "Закрепить отзыв" and not line.startswith("Показать полностью")]
        text = "\n".join(body).strip()
        rows.append({"id": make_id(source["id"], name, created, text, len(rows)), "sourceId": source["id"], "displayName": name, "text": text, "createdAt": created, "rating": 5})
    expected = int(re.search(r"на\s+основе\s+(\d+)\s+отзыв", original)[1])
    if len(rows) != expected:
        raise ValueError(f'{source["id"]}: ожидается {expected}, получено {len(rows)}')
    if "Вы посмотрели все отзывы" not in original:
        raise ValueError(f'{source["id"]}: не подтверждена загрузка всех отзывов')
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-root", type=pathlib.Path, required=True)
    parser.add_argument("--data", type=pathlib.Path, required=True)
    args = parser.parse_args()
    data = json.loads(args.data.read_text(encoding="utf-8"))
    reviews = {row["id"]: row for row in data["reviews"]}
    new_avito = avito_reviews(args.input_root / "reviews-avito-user-loaded-20261102.txt", data["reviews"])
    reviews.update({row["id"]: row for row in new_avito})
    data["report"] = [row for row in data.get("report", []) if row["sourceId"] != "avito"]
    data["report"].append({"sourceId": "avito", "count": len(new_avito), "ratedCount": 755, "unratedCount": 2, "status": "collected", "allTransactionStatuses": True})
    additions = [
        ({"id": "vk-ps-reviews", "platform": "vk", "title": "Геймворд | PlayStation", "url": "https://vk.ru/reviews-85243268"}, "reviews-vk-user-loaded-20261102.txt"),
        ({"id": "vk-xbox-reviews", "platform": "vk", "title": "Геймворд | Xbox", "url": "https://vk.ru/reviews-217049080"}, "reviews-vk-xbox-wheel-20261102.txt"),
        ({"id": "vk-steam-reviews", "platform": "vk", "title": "Геймворд | Steam", "url": "https://vk.ru/reviews-222135452"}, "reviews-vk-steam-user-loaded-20261102.txt"),
    ]
    for source, filename in additions:
        rows = vk_reviews(args.input_root / filename, source)
        if not any(row["id"] == source["id"] for row in data["sources"]):
            data["sources"].append(source)
        reviews.update({row["id"]: row for row in rows})
        data["report"] = [row for row in data["report"] if row["sourceId"] != source["id"]]
        data["report"].append({"sourceId": source["id"], "count": len(rows), "status": "collected"})
    def timestamp(row):
        value = datetime.datetime.fromisoformat(row["createdAt"])
        return value.replace(tzinfo=value.tzinfo or datetime.timezone.utc).timestamp()
    data["reviews"] = sorted(reviews.values(), key=timestamp, reverse=True)
    data["collectedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if len(data["reviews"]) != 2550:
        raise ValueError(f'Ожидалось 2550 записей, получено {len(data["reviews"])}')
    args.data.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"total": len(data["reviews"]), "report": data["report"]}, ensure_ascii=True))


if __name__ == "__main__":
    main()
