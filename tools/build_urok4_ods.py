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
    """Лист «Ассортимент товаров» — упражнение 1 (данные по учебнику без скана приближены)."""
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
    """Лист «Ксероксы» — рис. 8.15 (структура и числа согласованы с заданиями 4–7)."""
    t = Table(name="Ксероксы")
    for _ in range(6):
        t.addElement(TableColumn())

    t.addElement(merge_first_cell_row("Продажа копировальной техники. Отчёт", 6))
    t.addElement(TableRow())

    hdr = TableRow()
    for h in ("Торговый агент", "№ филиала", "Количество", "Цена (руб.)", "Выручка (руб.)", "Доставка"):
        hdr.addElement(cell_str(h))
    t.addElement(hdr)

    # Колонки: A-F; формула Выручка = Количество * Цена  -> E = C * D
    # Строка заголовков = 3, первая строка данных = 4
    raw = [
        ("Андреев В.П.", 195, 4, 1200, "АВИА"),
        ("Борисов К.М.", 261, 5, 3500, "Ж/Д"),
        ("Волков А.С.", 140, 3, 2800, "Авто"),
        ("Громов Д.Л.", 195, 3, 2500, "АВИА"),
        ("Дмитриев О.Н.", 261, 2, 2900, "Ж/Д"),
        ("Егоров П.Р.", 195, 10, 150, "АВИА"),
        ("Жуков И.Т.", 261, 4, 4200, "Ж/Д"),
        ("Зайцев В.Г.", 140, 2, 3100, "АВИА"),
        ("Иванов М.К.", 195, 8, 900, "Ж/Д"),
        ("Козлов С.А.", 261, 2, 3100, "Ж/Д"),
    ]

    first_row = 4
    for i, (агент, филиал, кол, цена, дост) in enumerate(raw):
        rnum = first_row + i
        row = TableRow()
        row.addElement(cell_str(агент))
        row.addElement(cell_float_num(float(филиал)))
        row.addElement(cell_float_num(float(кол)))
        row.addElement(cell_float_num(float(цена)))
        vr = float(кол) * float(цена)
        row.addElement(cell_formula_float(f"of:=C{rnum}*D{rnum}", vr))
        row.addElement(cell_str(дост))
        t.addElement(row)

    # Блок отсортированной таблицы (задание 4)
    t.addElement(TableRow())
    t.addElement(merge_first_cell_row("Отсортированная таблица (задание 4: агент по алфавиту, филиал по возрастанию)", 6))

    hdr2 = TableRow()
    for h in ("Торговый агент", "№ филиала", "Количество", "Цена (руб.)", "Выручка (руб.)", "Доставка"):
        hdr2.addElement(cell_str(h))
    t.addElement(hdr2)

    def sort_key(item):
        агент, филиал, *_ = item
        return (агент.lower(), филиал)

    sorted_raw = sorted(raw, key=sort_key)
    base_row = len(raw) + 7

    for i, (агент, филиал, кол, цена, дост) in enumerate(sorted_raw):
        rnum = base_row + i
        row = TableRow()
        row.addElement(cell_str(агент))
        row.addElement(cell_float_num(float(филиал)))
        row.addElement(cell_float_num(float(кол)))
        row.addElement(cell_float_num(float(цена)))
        vr = float(кол) * float(цена)
        row.addElement(cell_formula_float(f"of:=C{rnum}*D{rnum}", vr))
        row.addElement(cell_str(дост))
        t.addElement(row)

    # Задание 6: филиал 261, цена > 3000 (все строки — ксероксы по смыслу листа)
    t.addElement(TableRow())
    t.addElement(
        merge_first_cell_row(
            "Филиал 261, цена единицы свыше 3000 руб. (задание 6)", 6
        )
    )
    h6 = TableRow()
    for h in ("Торговый агент", "№ филиала", "Количество", "Цена (руб.)", "Выручка (руб.)", "Доставка"):
        h6.addElement(cell_str(h))
    t.addElement(h6)

    filt_261 = [(a, f, k, p, d) for (a, f, k, p, d) in raw if f == 261 and p > 3000]
    base6 = base_row + len(sorted_raw) + 3
    for i, (агент, филиал, кол, цена, дост) in enumerate(filt_261):
        rnum = base6 + i
        row = TableRow()
        row.addElement(cell_str(агент))
        row.addElement(cell_float_num(float(филиал)))
        row.addElement(cell_float_num(float(кол)))
        row.addElement(cell_float_num(float(цена)))
        vr = float(кол) * float(цена)
        row.addElement(cell_formula_float(f"of:=C{rnum}*D{rnum}", vr))
        row.addElement(cell_str(дост))
        t.addElement(row)

    # Задание 7: область критериев расширенного фильтра (И на строку 1, ИЛИ строка 2)
    t.addElement(TableRow())
    t.addElement(merge_first_cell_row("Критерии расширенного фильтра (задание 7)", 6))
    crit_hdr = TableRow()
    for h in ("№ филиала", "Выручка (руб.)", "Выручка (руб.)", "Доставка"):
        crit_hdr.addElement(cell_str(h))
    crit_hdr.addElement(cell_str(""))
    crit_hdr.addElement(cell_str(""))
    t.addElement(crit_hdr)

    r_crit1 = TableRow()
    r_crit1.addElement(cell_float_num(195))
    r_crit1.addElement(cell_str(">1000"))
    r_crit1.addElement(cell_str("<10000"))
    r_crit1.addElement(cell_str("АВИА"))
    r_crit1.addElement(cell_str(""))
    r_crit1.addElement(cell_str(""))
    t.addElement(r_crit1)

    r_crit2 = TableRow()
    r_crit2.addElement(cell_float_num(261))
    r_crit2.addElement(cell_str(">10000"))
    r_crit2.addElement(cell_str(""))
    r_crit2.addElement(cell_str("Ж/Д"))
    r_crit2.addElement(cell_str(""))
    r_crit2.addElement(cell_str(""))
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
