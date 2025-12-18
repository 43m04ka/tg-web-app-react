import React from 'react';
import style from './SortingFilter.module.scss'
import useGlobalData from "../../../../hooks/useGlobalData";


const Filter = ({onClose, json, setJson}) => {

    const {pageId} = useGlobalData()

    let parameters = [
        // {
        //     type: 'genre',
        //     name: 'Жанр',
        //     parameter: 'priceDown',
        //     image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADa0lEQVR4nO3cTYhNYRzH8YepwQbZmCIbNV6GxbDCwqSwYWJKFkjkbTElFkRRJGQla8WEMKURmrBTLGiwsfJWLBQLooxRxldPzkyMe91zz5x7zv859/eps7ud+zzne9/mzDmPcyIiIiIiIiIiIlIYwDLgSLS15T2eugVMAG7wr+vA+LzHV3eAM5R3Ou/x1eO7o/8/Qb6ae5cAs4B2YF2V2ypgmjMMaKayZmcBMBW4zegMAmf9K9EZBLTEmEOLhYE2AA9JT5cziICC+I+oNP0EZjpjCCjIMdK33hlDQEEO1CDIamcMAQWZH33MpOULMNEZQyhBPOBUSjF82M3OIEIK4gFbgKfAQIIQ/o+qe8BKZxShBSk6FMQWBTEGBbFFQYxBQWxREGNQEFsUxBgUxBYFMQYFsSW4IMA4oAPYB+zPYNsBNGU4v3CCAPOAl2RvANiW0RzDCBJdr/Sa/AwCSzOYZzBBNpK/ngzmGUyQ4+Tv+SgvY2oDNgGLgDFpB/H7BBZHz+GfqyHpeONMaA/5u59w7AuBVyP29bjUZUhJg/h9AU9GPM5/3y5IeswrTWoG8J18dSYYdxPwocz+3gGzRxvE7yPaVynv/RWfaTQoNbntwA/ycTPJRwBwuMJ+/4pSbZAKMYYcSrPDyAn6z8hLwCOgL4PtTvRCGJtwvD0xDvBwlGqCxIzhXUu7Q7CArhgHbDhK3CBVxPDO5X0czADWxjxoQ1H8WYhKOqqI4bXnfRzM4PdP0atVHLz+lB4z5Eq5n9h1C2iM7g/MWq+5u63qOEqvYtiJohiGoiiGoSiKYSiKYhiKohiGoiiGoSj5xwCm+7OXwEWg2+DWBewGJieI4s8ox+Uf21i7Ix1v0CuAz4ThLTC3RlFMxJgCfCIsz6o9bR8jSv4xooHuIkxLEsy1scxp+/MmYnjACcK0YRRzbo2uJfBbq7ME2EmdvEOCEH2HfKTg3yFBAZYH9CvrDTDHFZ1fEQ44CFww8DdHd4nNf/F2ApPyPlYiIiIiIiIiIiLyB///BeByhndQ9WWw3Y1WjKjdXbO1EA3a38BfVLeCiWLkLlyTd/rmAthLfXjgQmBkJQfTq0XU41onhVhPpSirARVmxaHURPdnv6CYvgFbXWiiq/rWRBc6nCzAdtQvjlaz9UhERERERERERERcsfwCAUkIIMPNItMAAAAASUVORK5CYII='
        // },
        {
            type: 'language',
            name: 'Локализация',
            list: ['Без перевода', 'Русские субтитры (текст)', 'На русском языке'],
            image: 'data:image/png;base64,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'
        },
        {
            type: 'numberPlayers',
            name: 'Количество игроков',
            list: ['1', '1-2', '1-4'],
            image: 'data:image/png;base64,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'
        },
    ]

    if (pageId === 20 || pageId === 28) {
        parameters = [{
            type: 'platform',
            name: 'Платформа',
            list: pageId === 20 ? ['PS5', 'PS4'] : ['One', 'Series'],
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAACOklEQVR4nO3dQU4bQRCF4dmEwyS+KiiAOA3kFE4OEsIS9FCLkUCRI3XVdDMvrv9bj9R2/TJsqu1l+Yukg6Tvkn5KehKe1lm0mRyWzyLpQtKdpJe9J2DsWdJtm9VnxPix97v9jzxMjbJ+MhBzMyvGYf0oIqbN7NuMINfBF4J3VzOC/PpwAGKOM4L8Cb4IvHucEQQbEMTMbkGWYkQQLwQxI4J4IYgZEcQLQcyIIF4IYkYE8UIQMyKIF4KYEUG8EMSMCOKFIHhDkGJB2BUO7gqrUyIEu8KZXWF1SsRgVzizKzwpCLvC2V3h3qcDMdgV3rIrPCEIu8J5VzOCsCucd5wRhF3hvMcZQbABQczsFmQpRgTxQhAzBDFDEDMEMUMQMwQxQxAzBDFDEDMEMUMQMwQxQxAzBDFDEDMEMUMQMwQxQxAzBDFDEDMEOfcgvQOOPl+FeueSLvCPAUefr0K9c2kLvukKJwYcfb4K9c5l1PWB8MHFqHcu623QzcIHF6PeuYy6ghY+uBhF5rJezd0kdXAhisxlvcbcruampQ4uRNG5rFFusn++0gcXoexc2tXcdhu0XUCM3BfcfPCZ015zIchpBDFDEDMEMUMQMwQxQxAzBDFDEDMEMUMQMwQxQxAzBDFDEDMEMUMQMwQxYx8EpxGkQJAhu8JF/Z4RhK8azzvOCDJkV7ioyxlB+LmKnDazr8ODjNoVLuh6SoxRu8LF3Ev6Mi3IiF3hIp7XH8CZG2PErrDOV5tBm8Xlqf8Zr/0i50Yg9yMiAAAAAElFTkSuQmCC'
        }, ...parameters]
    }

    const [selected, setSelected] = React.useState([])

    const [localJson, setLocalJson] = React.useState(json)

    const [counter, setCounter] = React.useState(0)
    return (
        <div className={style['container']} style={{height: String(window.innerHeight) + 'px'}}>
            <div>
                <div onClick={onClose}/>
                <div>
                    <div className={style['title']}>
                        Фильтры
                    </div>
                    {parameters.map((param, index) => (
                        <>
                            <div key={index} onClick={() => {
                                if (selected.indexOf(index) === -1) {
                                    setSelected([...selected, index])
                                } else {
                                    setSelected(selected.filter((item) => item !== index));
                                }

                            }}>
                                <div style={{backgroundImage: `url(${param.image})`}}/>
                                <p>
                                    {param.name}
                                </p>
                                <div className={style['arrow']}/>
                            </div>
                            <>{param.list.map(item => (
                                <div style={{height: selected.indexOf(index) !== -1 ? '9vw' : 0}}
                                     onClick={() => {
                                         let newJson = json
                                         if (!localJson[param.type].includes(item)) {
                                             newJson[param.type].push(item)
                                         } else {
                                             newJson[param.type] = newJson[param.type].filter((pos) => pos !== item)
                                         }
                                         setJson(newJson)
                                         setLocalJson(newJson)
                                         setCounter(counter + 1)
                                     }}>
                                    <input type="checkbox" checked={localJson[param.type].includes(item)}
                                           onChange={() => {
                                           }}/>
                                    <p>
                                        {item}
                                    </p>
                                </div>
                            ))}</>
                            {index < parameters.length - 1 ? (<div className={style['separator']}/>) : ''}
                        </>
                    ))}
                </div>
                <button onClick={onClose}>
                    Применить
                </button>
            </div>
        </div>);
};


export default Filter;