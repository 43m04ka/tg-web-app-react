#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate Урок 4.ods for laboratory work #4 (LibreOffice Calc)."""

from __future__ import annotations

from datetime import datetime

from odf.opendocument import OpenDocumentSpreadsheet
from odf.style import ParagraphProperties, Style, TableCellProperties, TextProperties
from odf.table import CoveredTableCell, Table, TableCell, TableColumn, TableRow
from odf.text import P

# Тонкая чёрная обводка как в учебнике (рис. 8.14 / 8.15).
_BORDER = "0.06pt solid #000000"
_YELLOW_HDR = "#fff2cc"  # светло-жёлтая шапка, рис. 8.14
_GREY_HDR = "#d9d9d9"  # серая шапка, рис. 8.15


def register_cell_styles(doc: OpenDocumentSpreadsheet) -> None:
    """Регистрирует авто-стили ячеек (office:automatic-styles)."""

    def add_style(
        name: str,
        *,
        bg: str | None = None,
        bold: bool = False,
        align: str = "start",
        fontfamily: str | None = "Arial",
    ) -> None:
        st = Style(name=name, family="table-cell", parentstylename="Default")
        tcp_kw: dict = dict(border=_BORDER, verticalalign="middle")
        if bg:
            tcp_kw["backgroundcolor"] = bg
        st.addElement(TableCellProperties(**tcp_kw))
        st.addElement(ParagraphProperties(textalign=align))
        tp_kw: dict = {}
        if bold:
            tp_kw["fontweight"] = "bold"
        if fontfamily:
            tp_kw["fontfamily"] = fontfamily
        if tp_kw:
            st.addElement(TextProperties(**tp_kw))
        doc.automaticstyles.addElement(st)

    # Лист «Ассортимент товаров» (рис. 8.14)
    add_style("ce_title", align="center", bold=True)
    add_style("ce_hdr_yellow", bg=_YELLOW_HDR, align="center", bold=True)
    add_style("ce_txt", align="start")
    add_style("ce_num", align="end")

    # Лист «Ксероксы» (рис. 8.15)
    add_style("ks_title", align="center", bold=True)
    add_style("ks_hdr_gray", bg=_GREY_HDR, align="center", bold=True)
    add_style("ks_td_agent", align="start")
    add_style("ks_td_center", align="center")
    add_style("ks_td_num", align="end")
    add_style("ks_covered", align="center")

    # Подзаголовки блоков заданий (объединённая строка)
    add_style("ks_block_title", align="center", bold=True)


def cell_str(text: str, stylename: str | None = None, **kwargs) -> TableCell:
    kw = dict(valuetype="string", stringvalue=text, **kwargs)
    if stylename:
        kw["stylename"] = stylename
    c = TableCell(**kw)
    c.addElement(P(text=text))
    return c


def cell_float_num(value: float, stylename: str | None = None, **kwargs) -> TableCell:
    s = str(value).replace(".", ",") if isinstance(value, float) else str(value)
    kw = dict(valuetype="float", value=value, **kwargs)
    if stylename:
        kw["stylename"] = stylename
    c = TableCell(**kw)
    c.addElement(P(text=s))
    return c


def cell_formula_float(
    formula_of: str,
    cached_value: float,
    display: str | None = None,
    stylename: str | None = None,
    **kwargs,
) -> TableCell:
    disp = display if display is not None else str(cached_value).replace(".", ",")
    kw = dict(valuetype="float", value=cached_value, formula=formula_of, **kwargs)
    if stylename:
        kw["stylename"] = stylename
    c = TableCell(**kw)
    c.addElement(P(text=disp))
    return c


def cell_formula_date(
    formula_of: str, iso_date: str, display: str, stylename: str | None = None, **kwargs
) -> TableCell:
    kw = dict(valuetype="date", datevalue=iso_date, formula=formula_of, **kwargs)
    if stylename:
        kw["stylename"] = stylename
    c = TableCell(**kw)
    c.addElement(P(text=display))
    return c


def covered_cells(n: int, stylename: str) -> list[TableCell]:
    return [CoveredTableCell(stylename=stylename) for _ in range(n)]


def merge_first_cell_row(
    text: str,
    total_cols: int,
    stylename: str = "ks_title",
    covered_style: str = "ks_covered",
) -> TableRow:
    row = TableRow()
    first = cell_str(text, stylename=stylename, numbercolumnsspanned=str(total_cols))
    row.addElement(first)
    for c in covered_cells(total_cols - 1, covered_style):
        row.addElement(c)
    return row


def build_assortiment_sheet() -> Table:
    """Лист «Ассортимент товаров» — упражнение 1; шапка таблицы как рис. 8.14."""
    t = Table(name="Ассортимент товаров")
    for _ in range(6):
        t.addElement(TableColumn())

    t.addElement(merge_first_cell_row("Информация о товарах", 6, stylename="ce_title", covered_style="ks_covered"))
    t.addElement(TableRow())

    r_labels = TableRow()
    r_labels.addElement(cell_str("Студент (ФИО):", "ce_txt"))
    r_labels.addElement(cell_str("Иванов И.И.", "ce_txt"))
    for _ in range(4):
        r_labels.addElement(cell_str("", "ce_txt"))
    t.addElement(r_labels)

    r_date = TableRow()
    r_date.addElement(cell_str("Дата:", "ce_txt"))
    today = datetime.now().date()
    today_iso = today.isoformat()
    r_date.addElement(
        cell_formula_date(
            "of:=TODAY()", today_iso, today.strftime("%d.%m.%Y"), stylename="ce_txt"
        )
    )
    for _ in range(4):
        r_date.addElement(cell_str("", "ce_txt"))
    t.addElement(r_date)

    t.addElement(TableRow())

    hdr = TableRow()
    for h in ("Товар", "Название", "Цена", "Стоимость", "Количество", "Сумма"):
        hdr.addElement(cell_str(h, "ce_hdr_yellow"))
    t.addElement(hdr)

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

    start_data_row = 7
    for i, (товар, название, цена, количество) in enumerate(rows_raw):
        rnum = start_data_row + i
        row = TableRow()
        row.addElement(cell_str(товар, "ce_txt"))
        row.addElement(cell_str(название, "ce_txt"))
        row.addElement(cell_float_num(float(цена), "ce_num"))
        cost_val = round(цена * 1.3, 2)
        row.addElement(cell_formula_float(f"of:=C{rnum}*1.3", float(cost_val), stylename="ce_num"))
        row.addElement(cell_float_num(float(количество), "ce_num"))
        sum_val = round(cost_val * количество, 2)
        row.addElement(cell_formula_float(f"of:=D{rnum}*E{rnum}", float(sum_val), stylename="ce_num"))
        t.addElement(row)

    return t


def build_kseroksy_sheet() -> Table:
    """Лист «Ксероксы» — рис. 8.15 (оформление по скрину)."""
    cols = 7
    t = Table(name="Ксероксы")
    for _ in range(cols):
        t.addElement(TableColumn())

    t.addElement(
        merge_first_cell_row(
            "Продажа копировальной техники. Отчёт",
            cols,
            stylename="ks_title",
            covered_style="ks_covered",
        )
    )

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
        hdr.addElement(cell_str(h, "ks_hdr_gray"))
    t.addElement(hdr)

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
        row.addElement(cell_str(агент, "ks_td_agent"))
        row.addElement(cell_float_num(float(филиал), "ks_td_center"))
        row.addElement(cell_str(модель, "ks_td_center"))
        row.addElement(cell_float_num(float(кол), "ks_td_center"))
        row.addElement(cell_float_num(float(цена), "ks_td_num"))
        vr = round(float(кол) * float(цена), 2)
        row.addElement(cell_formula_float(f"of:=D{rnum}*E{rnum}", float(vr), stylename="ks_td_num"))
        row.addElement(cell_str(дост, "ks_td_center"))
        t.addElement(row)

    for i, tup in enumerate(raw):
        add_data_row(first_data_row + i, tup)

    last_data_row = first_data_row + n_data - 1

    t.addElement(TableRow())
    t.addElement(
        merge_first_cell_row(
            "Отсортированная таблица (задание 4: агент по алфавиту, филиал по возрастанию)",
            cols,
            stylename="ks_block_title",
            covered_style="ks_covered",
        )
    )
    hdr2 = TableRow()
    for h in hdr_labels:
        hdr2.addElement(cell_str(h, "ks_hdr_gray"))
    t.addElement(hdr2)

    def sort_key(item: tuple) -> tuple:
        агент, филиал, модель, *_ = item
        return (агент.lower(), филиал, модель)

    sorted_raw = sorted(raw, key=sort_key)
    base_sorted = last_data_row + 4

    for i, tup in enumerate(sorted_raw):
        add_data_row(base_sorted + i, tup)

    t.addElement(TableRow())
    t.addElement(
        merge_first_cell_row(
            "Филиал 261, цена единицы свыше 3000 руб. (задание 6)",
            cols,
            stylename="ks_block_title",
            covered_style="ks_covered",
        )
    )
    h6 = TableRow()
    for h in hdr_labels:
        h6.addElement(cell_str(h, "ks_hdr_gray"))
    t.addElement(h6)

    filt_261 = [tup for tup in raw if tup[1] == 261 and tup[4] > 3000]
    base6 = base_sorted + n_data + 3
    for i, tup in enumerate(filt_261):
        add_data_row(base6 + i, tup)

    t.addElement(TableRow())
    t.addElement(
        merge_first_cell_row(
            "Критерии расширенного фильтра (задание 7)",
            4,
            stylename="ks_block_title",
            covered_style="ks_covered",
        )
    )
    crit_hdr = TableRow()
    for h in ("Филиал", "Выручка", "Выручка", "Доставка"):
        crit_hdr.addElement(cell_str(h, "ks_hdr_gray"))
    t.addElement(crit_hdr)

    r_crit1 = TableRow()
    r_crit1.addElement(cell_float_num(195, "ks_td_center"))
    r_crit1.addElement(cell_str(">1000", "ks_td_center"))
    r_crit1.addElement(cell_str("<10000", "ks_td_center"))
    r_crit1.addElement(cell_str("АВИА", "ks_td_center"))
    t.addElement(r_crit1)

    r_crit2 = TableRow()
    r_crit2.addElement(cell_float_num(261, "ks_td_center"))
    r_crit2.addElement(cell_str(">10000", "ks_td_center"))
    r_crit2.addElement(cell_str("", "ks_td_center"))
    r_crit2.addElement(cell_str("Ж/Д", "ks_td_center"))
    t.addElement(r_crit2)

    return t


def main() -> None:
    doc = OpenDocumentSpreadsheet()
    register_cell_styles(doc)
    doc.spreadsheet.addElement(build_assortiment_sheet())
    doc.spreadsheet.addElement(build_kseroksy_sheet())
    out = "/workspace/Урок 4.ods"
    doc.save(out)
    print(f"Written {out}")


if __name__ == "__main__":
    main()
