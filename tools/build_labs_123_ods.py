#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Генерирует Урок 1.ods, Урок 2.ods, Урок 3.ods для лаб. 1–3."""

from __future__ import annotations

from datetime import datetime

from odf.opendocument import OpenDocumentSpreadsheet
from odf.style import ParagraphProperties, Style, TableCellProperties, TextProperties
from odf.table import CoveredTableCell, Table, TableCell, TableColumn, TableRow
from odf.text import P

_BORDER = "0.06pt solid #000000"
_GREEN = "#e2efda"
_YELLOW_LBL = "#fff2cc"
_PINK_PROFIT = "#fce4d6"

_MONTHS = ("Март", "Апрель", "Май", "Июнь", "Июль", "Август")
_MC = ["C", "D", "E", "F", "G", "H"]

# Фиксированная разметка листа «Бюджет 2019» (колонки A–I):
R_TITLE, R_AUTH, R_DATE, R_GAP1 = 1, 2, 3, 4
R_ISX, R_ROST, R_UDOR = 5, 6, 7
R_GAP2, R_MONTHS = 8, 9
R_PRIHOD, R_ZATR, R_VYRCH = 10, 11, 12
R_GAP3, R_SEC = 13, 14
R_REK, R_ARE, R_NAL, R_PROC = 15, 16, 17, 18
R_RASH, R_PROF = 19, 20


def _oref(col: str, row: int) -> str:
    """Явная ссылка на ячейку в OpenFormula (текущий лист) — [.C10], без превращения в текст с кавычками."""
    return f"[.{col}{row}]"


def _oabs(col: str, row: int) -> str:
    """Абсолютная ссылка $C$6 в OpenFormula — [.$C$6]."""
    return f"[.${col}${row}]"


def _sum_rect(c1: str, r1: int, c2: str, r2: int) -> str:
    """Диапазон для SUM: C10:H10 → SUM([.C10:.H10])."""
    return f"SUM([.{c1}{r1}:.{c2}{r2}])"


def _sum_col(c: str, r1: int, r2: int) -> str:
    """Один столбец C15:C18 → SUM([.C15:.C18])."""
    return f"SUM([.{c}{r1}:.{c}{r2}])"


def _row_empty9(t: Table) -> None:
    rw = TableRow()
    for _ in range(9):
        rw.addElement(_txt("", "b_tl"))
    t.addElement(rw)


def _row_empty5(t: Table) -> None:
    rw = TableRow()
    for _ in range(5):
        rw.addElement(_txt("", "u_tl"))
    t.addElement(rw)


def _row_empty2(t: Table) -> None:
    rw = TableRow()
    rw.addElement(_txt("", "u_tl"))
    rw.addElement(_txt("", "u_tl"))
    t.addElement(rw)


def _reg(doc: OpenDocumentSpreadsheet, *, budget: bool) -> None:
    def add(n: str, bg: str | None, al: str, bold: bool = False) -> None:
        st = Style(name=n, family="table-cell", parentstylename="Default")
        k = dict(border=_BORDER, verticalalign="middle")
        if bg:
            k["backgroundcolor"] = bg
        st.addElement(TableCellProperties(**k))
        st.addElement(ParagraphProperties(textalign=al))
        tp = dict(fontfamily="Arial")
        if bold:
            tp["fontweight"] = "bold"
        st.addElement(TextProperties(**tp))
        doc.automaticstyles.addElement(st)

    add("u_tl", None, "start")
    add("u_hdr", _GREEN, "center", True)
    add("u_num", None, "end")
    add("u_merge", _GREEN, "center", True)
    add("u_cov", None, "center")

    if budget:
        add("b_tl", None, "start")
        add("b_hdr", _GREEN, "center", True)
        add("b_num", None, "end")
        add("b_merge", _GREEN, "center", True)
        add("b_sec", _GREEN, "center", True)
        add("b_plbl", _YELLOW_LBL, "start", True)
        add("b_pval", _PINK_PROFIT, "end")
        add("b_cov", None, "center")


def _txt(t: str, st: str | None = None, **kw) -> TableCell:
    d = dict(valuetype="string", stringvalue=t, **kw)
    if st:
        d["stylename"] = st
    c = TableCell(**d)
    c.addElement(P(text=t))
    return c


def _flt(
    v: float,
    st: str | None = None,
    *,
    formula: str | None = None,
    disp: str | None = None,
    **kw,
) -> TableCell:
    show = disp if disp is not None else str(v).replace(".", ",")
    d = dict(valuetype="float", value=float(v), **kw)
    if formula:
        d["formula"] = formula
    if st:
        d["stylename"] = st
    c = TableCell(**d)
    c.addElement(P(text=show))
    return c


def _dat(iso: str, disp: str) -> TableCell:
    c = TableCell(
        valuetype="date",
        datevalue=iso,
        formula="of:=TODAY()",
        stylename="b_tl",
    )
    c.addElement(P(text=disp))
    return c


def _mrg(t: str, n: int, st: str, cov: str) -> TableRow:
    row = TableRow()
    row.addElement(_txt(t, st, numbercolumnsspanned=str(n)))
    for _ in range(n - 1):
        row.addElement(CoveredTableCell(stylename=cov))
    return row


def tab_rashody() -> Table:
    t = Table(name="Расходы фирмы")
    for _ in range(5):
        t.addElement(TableColumn())

    t.addElement(_mrg("Расходы фирмы за второе полугодие 2019 года", 5, "u_merge", "u_cov"))

    er = TableRow()
    for _ in range(5):
        er.addElement(_txt("", "u_tl"))
    t.addElement(er)

    h = TableRow()
    for x in ("Месяц", "Аренда", "Заработная плата", "Запчасти", "Общие расходы"):
        h.addElement(_txt(x, "u_hdr"))
    t.addElement(h)

    er2 = TableRow()
    for _ in range(5):
        er2.addElement(_txt("", "u_tl"))
    t.addElement(er2)

    rows = [
        ("Июль", 35000, 8400, 28000),
        ("Август", 35000, 8400, 31500),
        ("Сентябрь", 35000, 9100, 31500),
        ("Октябрь", 42000, 9100, 31500),
        ("Ноябрь", 42000, 9100, 35000),
        ("Декабрь", 42000, 9800, 38500),
    ]
    for i, (mo, a, z, zp) in enumerate(rows, start=5):
        row = TableRow()
        row.addElement(_txt(mo, "u_tl"))
        row.addElement(_flt(float(a), "u_num"))
        row.addElement(_flt(float(z), "u_num"))
        row.addElement(_flt(float(zp), "u_num"))
        tot = a + z + zp
        row.addElement(
            _flt(
                float(tot),
                "u_num",
                formula=f"of:={_oref('B', i)}+{_oref('C', i)}+{_oref('D', i)}",
            )
        )
        t.addElement(row)
    return t


def _head_budget(t: Table, *, rost: float, udor: float) -> None:
    """Шапка листа «Бюджет»: темпы в C6 и C7 (как $C$6 и $C$7 в формулах ЛР 2)."""
    t.addElement(_mrg("Торговый бюджет: 2019 финансовый год", 9, "b_merge", "b_cov"))

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Составил", "b_tl"))
    r.addElement(_txt("Иванов И.И.", "b_tl"))
    for _ in range(6):
        r.addElement(_txt("", "b_tl"))
    t.addElement(r)

    dt = datetime.now().date()
    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Дата", "b_tl"))
    r.addElement(_dat(dt.isoformat(), dt.strftime("%d.%m.%Y")))
    for _ in range(6):
        r.addElement(_txt("", "b_tl"))
    t.addElement(r)

    _row_empty9(t)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Исходные данные", "b_hdr"))
    r.addElement(_txt("", "b_hdr"))
    for _ in range(6):
        r.addElement(_txt("", "b_hdr"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Рост объёма продаж", "b_tl"))
    r.addElement(_flt(float(rost), "b_num"))
    for _ in range(6):
        r.addElement(_txt("", "b_tl"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Удорожание товаров", "b_tl"))
    r.addElement(_flt(float(udor), "b_num"))
    for _ in range(6):
        r.addElement(_txt("", "b_tl"))
    t.addElement(r)

    _row_empty9(t)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("", "b_hdr"))
    for m in _MONTHS:
        r.addElement(_txt(m, "b_hdr"))
    r.addElement(_txt("Всего", "b_hdr"))
    t.addElement(r)


def tab_budget_urok1() -> Table:
    t = Table(name="Бюджет 2019")
    for _ in range(9):
        t.addElement(TableColumn())

    _head_budget(t, rost=0.15, udor=0.12)

    приход = [32550, 33255, 33960, 34665, 35370, 32982]
    затр = [19316, 19455, 19680, 19905, 20130, 20640]
    r_pr, r_z, r_v = R_PRIHOD, R_ZATR, R_VYRCH

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Приход", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for v in приход:
        r.addElement(_flt(float(v), "b_num"))
    r.addElement(_flt(sum(приход), "b_num", formula=f"of:={_sum_rect('C', r_pr, 'H', r_pr)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Затраты на товар", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for v in затр:
        r.addElement(_flt(float(v), "b_num"))
    r.addElement(_flt(sum(затр), "b_num", formula=f"of:={_sum_rect('C', r_z, 'H', r_z)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Полная выручка", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for i, L in enumerate(_MC):
        r.addElement(
            _flt(
                float(приход[i] - затр[i]),
                "b_num",
                formula=f"of:={_oref(L, r_pr)}-{_oref(L, r_z)}",
            )
        )
    r.addElement(
        _flt(
            sum(приход[i] - затр[i] for i in range(6)),
            "b_num",
            formula=f"of:={_sum_rect('C', r_v, 'H', r_v)}",
        )
    )
    t.addElement(r)

    _row_empty9(t)

    t.addElement(_mrg("Статьи расходов", 9, "b_sec", "b_cov"))

    r_rk, r_ar, r_nl, r_pc = R_REK, R_ARE, R_NAL, R_PROC

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Реклама", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for _ in range(6):
        r.addElement(_flt(4000.0, "b_num"))
    r.addElement(_flt(24000.0, "b_num", formula=f"of:={_sum_rect('C', r_rk, 'H', r_rk)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Аренда помещений", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for _ in range(6):
        r.addElement(_flt(500.0, "b_num"))
    r.addElement(_flt(3000.0, "b_num", formula=f"of:={_sum_rect('C', r_ar, 'H', r_ar)}"))
    t.addElement(r)

    нл = [240, 241, 242, 243, 244, 245]
    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Налоги и выплаты", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for v in нл:
        r.addElement(_flt(float(v), "b_num"))
    r.addElement(_flt(float(sum(нл)), "b_num", formula=f"of:={_sum_rect('C', r_nl, 'H', r_nl)}"))
    t.addElement(r)

    proc = [800 + 7 * i for i in range(6)]
    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Проценты по кредитам", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for v in proc:
        r.addElement(_flt(float(v), "b_num"))
    r.addElement(_flt(float(sum(proc)), "b_num", formula=f"of:={_sum_rect('C', r_pc, 'H', r_pc)}"))
    t.addElement(r)

    rs, pf = R_RASH, R_PROF

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Расходы всего", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for L in _MC:
        r.addElement(_flt(0.0, "b_num", formula=f"of:={_sum_col(L, r_rk, r_pc)}"))
    r.addElement(_flt(0.0, "b_num", formula=f"of:={_sum_rect('C', rs, 'H', rs)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Прибыль", "b_plbl"))
    r.addElement(_txt("", "b_plbl"))
    for L in _MC:
        r.addElement(_flt(0.0, "b_pval", formula=f"of:={_oref(L, r_v)}-{_oref(L, rs)}"))
    r.addElement(_flt(0.0, "b_pval", formula=f"of:={_oref('I', r_v)}-{_oref('I', rs)}"))
    t.addElement(r)

    return t


def tab_budget_urok2() -> Table:
    """ЛР 2: март как на рис. 6.11; апрель–август по формулам; C6=1.5, C7=0.9."""
    t = Table(name="Бюджет 2019")
    for _ in range(9):
        t.addElement(TableColumn())

    _head_budget(t, rost=1.5, udor=0.9)

    rp, rz, rv = R_PRIHOD, R_ZATR, R_VYRCH
    rr, ra, rn, rp2 = R_REK, R_ARE, R_NAL, R_PROC
    rs, pf = R_RASH, R_PROF

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Приход", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    r.addElement(_flt(32550.0, "b_num"))
    for i in range(1, 6):
        prev = _MC[i - 1]
        r.addElement(
            _flt(
                0.0,
                "b_num",
                formula=f"of:={_oref(prev, rp)}+{_oref(prev, rp)}*{_oabs('C', R_ROST)}",
            )
        )
    r.addElement(_flt(0.0, "b_num", formula=f"of:={_sum_rect('C', rp, 'H', rp)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Затраты на товар", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    r.addElement(_flt(19316.0, "b_num"))
    for i in range(1, 6):
        prev = _MC[i - 1]
        r.addElement(
            _flt(
                0.0,
                "b_num",
                formula=f"of:={_oref(prev, rz)}+{_oref(prev, rz)}*{_oabs('C', R_UDOR)}",
            )
        )
    r.addElement(_flt(0.0, "b_num", formula=f"of:={_sum_rect('C', rz, 'H', rz)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Полная выручка", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for L in _MC:
        r.addElement(_flt(0.0, "b_num", formula=f"of:={_oref(L, rp)}-{_oref(L, rz)}"))
    r.addElement(_flt(0.0, "b_num", formula=f"of:={_sum_rect('C', rv, 'H', rv)}"))
    t.addElement(r)

    _row_empty9(t)

    t.addElement(_mrg("Статьи расходов", 9, "b_sec", "b_cov"))

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Реклама", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for _ in range(6):
        r.addElement(_flt(4000.0, "b_num"))
    r.addElement(_flt(24000.0, "b_num", formula=f"of:={_sum_rect('C', rr, 'H', rr)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Аренда помещений", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for _ in range(6):
        r.addElement(_flt(500.0, "b_num"))
    r.addElement(_flt(3000.0, "b_num", formula=f"of:={_sum_rect('C', ra, 'H', ra)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Налоги и выплаты", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    r.addElement(_flt(240.0, "b_num"))
    for i in range(1, 6):
        prev = _MC[i - 1]
        r.addElement(_flt(0.0, "b_num", formula=f"of:={_oref(prev, rn)}+{_oref(prev, rn)}*0.4"))
    r.addElement(_flt(0.0, "b_num", formula=f"of:={_sum_rect('C', rn, 'H', rn)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Проценты по кредитам", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    r.addElement(_flt(800.0, "b_num"))
    for i in range(1, 6):
        prev = _MC[i - 1]
        r.addElement(_flt(0.0, "b_num", formula=f"of:={_oref(prev, rp2)}+7"))
    r.addElement(_flt(0.0, "b_num", formula=f"of:={_sum_rect('C', rp2, 'H', rp2)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Расходы всего", "b_tl"))
    r.addElement(_txt("", "b_tl"))
    for L in _MC:
        r.addElement(_flt(0.0, "b_num", formula=f"of:={_sum_col(L, rr, rp2)}"))
    r.addElement(_flt(0.0, "b_num", formula=f"of:={_sum_rect('C', rs, 'H', rs)}"))
    t.addElement(r)

    r = TableRow()
    r.addElement(_txt("", "b_tl"))
    r.addElement(_txt("Прибыль", "b_plbl"))
    r.addElement(_txt("", "b_plbl"))
    for L in _MC:
        r.addElement(_flt(0.0, "b_pval", formula=f"of:={_oref(L, rv)}-{_oref(L, rs)}"))
    r.addElement(_flt(0.0, "b_pval", formula=f"of:={_oref('I', rv)}-{_oref('I', rs)}"))
    t.addElement(r)

    return t


def tab_tan() -> Table:
    t = Table(name="Диаграмма типа Линии")
    for _ in range(2):
        t.addElement(TableColumn())

    h = TableRow()
    h.addElement(_txt("X", "u_hdr"))
    h.addElement(_txt("Y=tg X", "u_hdr"))
    t.addElement(h)

    for i in range(21):
        rr = i + 2
        x = -10 + i
        row = TableRow()
        row.addElement(_flt(float(x), "u_num"))
        row.addElement(_flt(0.0, "u_num", formula=f"of:=TAN({_oref('A', rr)})"))
        t.addElement(row)

    _row_empty2(t)
    row = TableRow()
    row.addElement(_txt("Рисунок 7.5 – диаграмма типа «Линии» по столбцам A:B", "u_tl", numbercolumnsspanned="2"))
    row.addElement(CoveredTableCell(stylename="u_cov"))
    t.addElement(row)

    return t


def main() -> None:
    d1 = OpenDocumentSpreadsheet()
    _reg(d1, budget=True)
    d1.spreadsheet.addElement(tab_budget_urok1())
    d1.spreadsheet.addElement(tab_rashody())
    d1.save("/workspace/Урок 1.ods")

    d2 = OpenDocumentSpreadsheet()
    _reg(d2, budget=True)
    d2.spreadsheet.addElement(tab_budget_urok2())
    d2.save("/workspace/Урок 2.ods")

    d3 = OpenDocumentSpreadsheet()
    _reg(d3, budget=False)
    d3.spreadsheet.addElement(tab_tan())
    d3.save("/workspace/Урок 3.ods")

    print("Written Урок 1.ods, Урок 2.ods, Урок 3.ods")


if __name__ == "__main__":
    main()
