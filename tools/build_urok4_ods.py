#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate Урок 4.ods for laboratory work #4 (LibreOffice Calc)."""

from __future__ import annotations

from datetime import datetime

from odf.opendocument import OpenDocumentSpreadsheet
from odf.table import CoveredTableCell, Table, TableCell, TableColumn, TableRow
from odf.text import P


def cell_str(text: str, **kwargs) -> TableCell:
    c = TableCell(valuetype="string", stringvalue=text, **kwargs)
    c.addElement(P(text=text))
    return c


def cell_float_num(value: float, **kwargs) -> TableCell:
    s = str(value).replace(".", ",") if isinstance(value, float) else str(value)
    c = TableCell(valuetype="float", value=value, **kwargs)
    c.addElement(P(text=s))
    return c


def cell_formula_float(formula_of: str, cached_value: float, display: str | None = None) -> TableCell:
    disp = display if display is not None else str(cached_value).replace(".", ",")
    c = TableCell(valuetype="float", value=cached_value, formula=formula_of)
    c.addElement(P(text=disp))
    return c


def cell_formula_date(formula_of: str, iso_date: str, display: str) -> TableCell:
    c = TableCell(valuetype="date", datevalue=iso_date, formula=formula_of)
    c.addElement(P(text=display))
    return c


def covered_cells(n: int) -> list[TableCell]:
    return [CoveredTableCell() for _ in range(n)]


def merge_first_cell_row(text: str, total_cols: int) -> TableRow:
    row = TableRow()
    first = cell_str(text, numbercolumnsspanned=str(total_cols))
    row.addElement(first)
    for c in covered_cells(total_cols - 1):
        row.addElement(c)
    return row


def build_assortiment_sheet() -> Table:
    """Лист «Ассортимент товаров» — упражнение 1 (рис. 8.1 в PDF без скана; данные приближены)."""
    t = Table(name="Ассортимент товаров")
    for _ in range(6):
        t.addElement(TableColumn())

    # Шапка документа
    t.addElement(merge_first_cell_row("Информация о товарах", 6))
    t.addElement(TableRow())  # пустая строка над таблицей (для фильтрации в методичке)

    r_labels = TableRow()
    r_labels.addElement(cell_str("Студент (ФИО):"))
    r_labels.addElement(cell_str("Иванов И.И."))
    for _ in range(4):
        r_labels.addElement(cell_str(""))
    t.addElement(r_labels)

    r_date = TableRow()
    r_date.addElement(cell_str("Дата:"))
    today = datetime.now().date()
    today_iso = today.isoformat()
    r_date.addElement(
        cell_formula_date(
            "of:=TODAY()", today_iso, today.strftime("%d.%m.%Y")
        )
    )
    for _ in range(4):
        r_date.addElement(cell_str(""))
    t.addElement(r_date)

    t.addElement(TableRow())

    hdr = TableRow()
    for h in ("Товар", "Название", "Цена", "Стоимость", "Количество", "Сумма"):
        hdr.addElement(cell_str(h))
    t.addElement(hdr)

    # Данные (Товар, Название, Цена); Стоимость = Цена*1.3; Сумма = Стоимость*Количество
    rows_raw = [
        ("Ксерокс", "Персональный", 2100, 120),
        ("Ксерокс", "Деловой", 1900, 200),
        ("Ксерокс", "Профессиональный", 4800, 45),
        ("Факс", "Персональный", 3200, 80),
        ("Факс", "Профессиональный", 4100, 60),
        ("Факс", "Деловой", 2750, 150),
        ("Ксерокс", "Профессиональный Плюс", 5200, 30),
        ("Факс", "Профессиональный Плюс", 4550, 25),
    ]

    start_data_row = 7  # 1-based row index in sheet for first formula row (header is row 6)
    for i, (товар, название, цена, количество) in enumerate(rows_raw):
        rnum = start_data_row + i
        row = TableRow()
        row.addElement(cell_str(товар))
        row.addElement(cell_str(название))
        row.addElement(cell_float_num(float(цена)))
        cost_val = round(цена * 1.3, 2)
        row.addElement(cell_formula_float(f"of:=C{rnum}*1.3", float(cost_val)))
        row.addElement(cell_float_num(float(количество)))
        sum_val = round(cost_val * количество, 2)
        row.addElement(cell_formula_float(f"of:=D{rnum}*E{rnum}", float(sum_val)))
        t.addElement(row)

    return t


def build_kseroksy_sheet() -> Table:
    """Лист «Ксероксы» — рис. 8.15 из методички (данные со скрина учебника)."""
    cols = 7
    t = Table(name="Ксероксы")
    for _ in range(cols):
        t.addElement(TableColumn())

    # Рис. 8.15: строка 1 — заголовок отчёта, строка 2 — шапка таблицы, строки 3–15 — данные (без лишней пустой строки).
    t.addElement(merge_first_cell_row("Продажа копировальной техники. Отчёт", cols))

    hdr_labels = (
        "Торговый агент",
        "Филиал",
        "Модель",
        "Количество",
        "Цена",
        "Выручка",
        "Доставка",
    )
    hdr = TableRow()
    for h in hdr_labels:
        hdr.addElement(cell_str(h))
    t.addElement(hdr)

    # Кортеж: агент, филиал, модель, количество, цена, доставка (цена как в учебнике).
    raw = [
        ("Белкин Семён", 261, "C250GLS", 6, 4620.8, "АВИА"),
        ("Белкин Семён", 195, "C100GLS", 2, 1289.6, "АВИА"),
        ("Милова Жанна", 261, "C300GLS", 5, 3208.9, "АВИА"),
        ("Милова Жанна", 195, "C100GLS", 9, 1074.7, "Ж/Д"),
        ("Милова Жанна", 261, "C300GLS", 2, 3208.9, "АВИА"),
        ("Матвиенко Пётр", 195, "C500GLS", 4, 1149.8, "Ж/Д"),
        ("Матвиенко Пётр", 261, "C150GLS", 3, 1547.5, "АВИА"),
        ("Матвиенко Пётр", 195, "C250GLS", 2, 4620.8, "АВИА"),
        ("Сергеев Максим", 261, "C400GLS", 8, 5545.0, "АВИА"),
        ("Сергеев Максим", 195, "C150GLS", 3, 1547.5, "Ж/Д"),
        ("Гранкин Александр", 261, "C500GLS", 1, 1149.8, "АВИА"),
        ("Гранкин Александр", 195, "C200GLS", 6, 1547.5, "Ж/Д"),
        ("Гранкин Александр", 261, "C300GLS", 5, 3208.9, "Ж/Д"),
    ]

    header_row = 2
    first_data_row = header_row + 1
    n_data = len(raw)

    def add_data_row(rnum: int, row_tuple: tuple) -> None:
        агент, филиал, модель, кол, цена, дост = row_tuple
        row = TableRow()
        row.addElement(cell_str(агент))
        row.addElement(cell_float_num(float(филиал)))
        row.addElement(cell_str(модель))
        row.addElement(cell_float_num(float(кол)))
        row.addElement(cell_float_num(float(цена)))
        vr = round(float(кол) * float(цена), 2)
        row.addElement(cell_formula_float(f"of:=D{rnum}*E{rnum}", float(vr)))
        row.addElement(cell_str(дост))
        t.addElement(row)

    for i, tup in enumerate(raw):
        add_data_row(first_data_row + i, tup)

    last_data_row = first_data_row + n_data - 1

    # Задание 4: новая таблица — фамилии по алфавиту, № филиала по возрастанию.
    t.addElement(TableRow())
    t.addElement(
        merge_first_cell_row(
            "Отсортированная таблица (задание 4: агент по алфавиту, филиал по возрастанию)",
            cols,
        )
    )
    hdr2 = TableRow()
    for h in hdr_labels:
        hdr2.addElement(cell_str(h))
    t.addElement(hdr2)

    def sort_key(item: tuple) -> tuple:
        агент, филиал, модель, *_ = item
        return (агент.lower(), филиал, модель)

    sorted_raw = sorted(raw, key=sort_key)
    base_sorted = last_data_row + 4

    for i, tup in enumerate(sorted_raw):
        add_data_row(base_sorted + i, tup)

    # Задание 6: филиал 261 и цена единицы > 3000 руб.
    t.addElement(TableRow())
    t.addElement(
        merge_first_cell_row(
            "Филиал 261, цена единицы свыше 3000 руб. (задание 6)",
            cols,
        )
    )
    h6 = TableRow()
    for h in hdr_labels:
        h6.addElement(cell_str(h))
    t.addElement(h6)

    filt_261 = [tup for tup in raw if tup[1] == 261 and tup[4] > 3000]
    base6 = base_sorted + n_data + 3
    for i, tup in enumerate(filt_261):
        add_data_row(base6 + i, tup)

    # Задание 7: шаблон области критериев расширенного фильтра (как в методичке).
    t.addElement(TableRow())
    t.addElement(merge_first_cell_row("Критерии расширенного фильтра (задание 7)", 4))
    crit_hdr = TableRow()
    for h in ("Филиал", "Выручка", "Выручка", "Доставка"):
        crit_hdr.addElement(cell_str(h))
    t.addElement(crit_hdr)

    r_crit1 = TableRow()
    r_crit1.addElement(cell_float_num(195))
    r_crit1.addElement(cell_str(">1000"))
    r_crit1.addElement(cell_str("<10000"))
    r_crit1.addElement(cell_str("АВИА"))
    t.addElement(r_crit1)

    r_crit2 = TableRow()
    r_crit2.addElement(cell_float_num(261))
    r_crit2.addElement(cell_str(">10000"))
    r_crit2.addElement(cell_str(""))
    r_crit2.addElement(cell_str("Ж/Д"))
    t.addElement(r_crit2)

    return t


def main() -> None:
    doc = OpenDocumentSpreadsheet()
    doc.spreadsheet.addElement(build_assortiment_sheet())
    doc.spreadsheet.addElement(build_kseroksy_sheet())
    out = "/workspace/Урок 4.ods"
    doc.save(out)
    print(f"Written {out}")


if __name__ == "__main__":
    main()
