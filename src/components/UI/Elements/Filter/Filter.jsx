import React from 'react';
import style from './SortingFilter.module.scss'
import useGlobalData from "../../../../hooks/useGlobalData";
import {useTelegram} from "../../../../hooks/useTelegram";


const Filter = ({onClose, json, setJson}) => {

    const {tg} = useTelegram()
    const {pageId} = useGlobalData()

    let parameters = [
        {
            type: 'type',
            name: 'Тип продукта',
            list: [
                {label: 'Игра', value: 'GAME'},
                {label: 'DLC', value: 'ADD_ON'},
                {label: 'Донат', value: 'DONATION'}
            ],
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADHUlEQVR4nO3cz4tNYRzH8UMWg0FRrJSSGiGLMcRVbIfyY3Kz4A+QhZiRZm/MYkoRNhNRjKKwItn5OZsRfwBhMzu/FpNReOvJXdzCveec+zzP+Z57P686NZv77Tzn0517np9JIiIiIiIiIiIiIiIiIiIiIpkBi4FLwDT+uZoXgUXZ76xDAQ8I7xEwp+i2mgesI561RbfXPGAgYiADGe5rITAI3ABul+i6DOxuJZBqxECqKe+pG3hNuY22UyDDlN8vYHWMQN4A92uX+ztEIHdoDwdDBnIXWP+Pz28A7nkO5ALtYXuoQAZT1BnyGEgPMEO5vcj1mp8ikPMZarkOYMuBOMA24DkwS7l8Bq4CS5M8mgTy0fXiM9RaAnzyEUjHahLIeI56VxRIuECO5Kh3VIGEC+RQjnqHFUi4QE7mqHdKgYQL5GGOem5UV4EECuSH6/hlqLUR+OkrEGAVsLd2j7GvA0Bf9CmDFP2QKWB+ijoLgJce+yGjTcKN5RmwrOUH7bmn/hhY3qDGCuCJx576fmyZ8PrQPY1lfQFOA7214XF3bQJGgK8pa6QN5Ca2fAPmhk/D7vD7BLZ0fCD7sMXkvywfsvyonzHyo/409o96f8TG9We8t5XAngJfe3vDPfnGb0jfI4Qx2+hNTf6eXHJzwKG42ieKbmepADuBcwGWxbiaO4pun4iIiIiIiEi5uGlaoBJgkK6SZgpY6gBbgA8Bx7LeA5uLbmeZvhkhw6gPpavo9prn9jAQT6Xo9ppneMawAkxGmqvxyS34uJZ7ltFiILTHhp3JUBt2fNKWthYDOZvjNdd95n+06bPFQKpF1EPbos0F0g28otxGModhNZC6ozWOA9cNHJeR5RoHdiV5WQ2kYykQYxSIMQrEGAVijAIxxmogFH+i3C1gDFiTdHog2DpRbibXmFSbBTKMLVNJLBpcTMXt5JoXPg0Nv6c1HT4J24H0GJugGgqfhOFAjJwo54bP3wLHoh6vUZu7jmVrtIaVfBmQW6IT2jstA0rJLWILHIoLoy/t/cifULoCLiXVN0NERERERERERERERCTpLL8BpFLYRCVxXEQAAAAASUVORK5CYII='
        },
        {
            type: 'language',
            name: 'Локализация',
            list: [
                {label: 'Без перевода'},
                {label: 'Русские субтитры (текст)'},
                {label: 'На русском языке'}
            ],
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEaElEQVR4nO2dTYhWVRiAT1K5EAdzk6LWmPkD7dzpRlf+zEqIjwJDilAhYdLKPxBduHGhgpKGUEizc8B+CEJoE1mTgzpR7oKSgnKRmmIQks4TB8/A5XrPN/fnfDPnPfd94G7mnve857sP99xzzz33jjGKoiiKoiiKoiiKoiiKoijTBbAc2AucBYYj3N4HXgfmmJQBZgMfAw+RwW1gq0lYxhgyOWxSw50ZkhkwiV0zpHRTPsZMKgD7SIPFJgXcaCoF1psUcEPJQkxkAJ0uQjomBVRIZKiQyFAhkaFCWiSE3AEMXZ8KqV53R4VURIVEhgqJDBWSgJBJDkxjTL28KqRXmHp5VUivMPXytlrIQndwmmyjmVTfZvd1yatCepj3y0yqj0rGqJAe5v0+k+p4yRgV4olZkOt+ZtTI+2cm1dsBhBwL0I0OAEuMQCHrckX7K+acl4vfWDKup4OJDD8Bm4wgIf25opsr5nwlE2sXWDwTmZAJjhop1xDgl0zR7yrm/DQTO1ohbqqFWHYYIUIO5oq/WjLfS7llR++UjOsDRph67pQ9g6dbyFzgZqb4rcmuJcAM4GIm5q6tJ2IZE7xhJAx7C7qQX4HnPWWfAE7lyh8SIMNyyki5DwGGcmG/AatzZWYVLFe9BswUIMNyzggS8jTweS70P+AE8CzwGnA9t/8vYJkQGZbhYAd8Ku7UnZTzBVU8LPjbDWClIBnxC3GTi1uA7cB+4CTwhTszJuMs8JatQ4gMEUJC3A90PDKyc1yxkISQu8A3wL9lhER6ZogS8sC9VnbDzf1cAD5w3dEq4MnMgX7ZdWtfA38A97JCasi43WW7T9uEBM7fV7GbGqs4gxCCdgih3jVjf4k3wkKTvhDqX8CXlqj7R8KSthDqy7hasv4DhCVdITQb2u4rmWMZYUlTCM2Hto89XgUGPbl+QKiQc10a0gm8jTQ4KFc8z/b/Bp4q2GdnEEQKyU+Jx8qegrZvc/vWFOx7QaoQ+yEXCSwpaPvELPMRz2+7KlHIHHeHGzOXC9o9E/jH7b/m+W32q0ayhLiGbyVudhe0eX2uzCJPtzUuTohr/GHiZLzoWb2bG8uyzfO7LosU4ho/EOFnmkZLLEOyfOYpt1uskNxCuA0BhrnHAhyM9wrat7Rglvd3z/C3P0C3Nb1CQkHzB1njvlUsFdtxSYWYIEJGArXjXRViggjZFagdixp2WyqERwfwuYBtaTJto0LwdFduuuSrLttaT9xOFUIjITtrToec7rJ0qe63JVsvZLyouwLml7gWXO/SHvtyaR1aL+Sip743S8Yv98QP1mxP64UMeur7pGF3N88tX6pK64WcB84UbHY9Vxl+9sSfcQv4qtJ6IbGhQiJDhUSGCokMFRIZKiQykhGygTT40KQA8CJpUGoJqwh49DKPZOyE5AqTCsAmZDNkUgM4ikzseyZ9JkWAHe5DLlK6qaFkZUxgv6pjP+Ti/jnkcISbfYd+T1LXDEVRFEVRFEVRFEVRFEVRjDj+B2E5wnOK+hRiAAAAAElFTkSuQmCC'
        },
        {
            type: 'numberPlayers',
            name: 'Количество игроков',
            list: [
                {label: '1 игрок', value: '1'},
                {label: '1-2 игрока', value: '1-2'},
                {label: '1-4 игрока', value: '1-4'}
            ],
            image: 'data:image/png;base64,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'
        },
        {
            type: 'genre',
            name: 'Жанр',
            list: [
                {label: 'Экшен'},
                {label: 'Приключения'},
                {label: 'Аркада'},
                {label: 'Казуальные игры'},
                {label: 'Вождение/Гонки'},
                {label: 'Файтинг'},
                {label: 'Хоррор'},
                {label: 'Музыка/Ритм'},
                {label: 'Для вечеринок'},
                {label: 'Платформер'},
                {label: 'Головоломки'},
                {label: 'Ролевые игры'},
                {label: 'Шутер'},
                {label: 'Симулятор'},
                {label: 'Спорт'},
                {label: 'Стратегия'},
                {label: 'Обучающие'},
                {label: 'Семейные'},
                {label: 'Уникальные'}
            ],
            image: 'data:image/png;base64,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'
        },
    ]

    if (pageId === 20 || pageId === 28) {
        parameters = [{
            type: 'platform',
            name: 'Платформа',
            list: pageId === 20 ? ['PS5', 'PS4'] : ['One', 'Series'],
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADqElEQVR4nO2dy6tNURzHt0chl5CJRyl3iCJ5DAykK5eBq4Q/wGMiAyYGQpTyKJlIuSaKgT2X0Z0ib2Imz/JMHqE8P9rupuO017rHXvuxzjrfT+3ZWb/1XftzTmfvffb+nSgSQgghhBBCCCGEEEKIqgCmAZuBo8AZINZGsi2uWsRc4ALwE5HFuipl7AR+ZMYQ1QoBjv2dUtQrBNhijSCqEwJMBt7/M6WoVchB6/SiciEPMHMdWAqMLTWEGATotsh4BIyrO2NHkb77TeyuO1/HAay1CNlQd76OI/mC8uKMVAwiIZ4RmhAGD1JWpeuqe+sDFgIjO04IsAa4g5+8AfYCYzpCCHCE9uBqclUkaCHANtqLAWBYkEKAScA72o/1oQrZRHtyPlQhJ2hPXoYq5JwtuwfbJUO2n6EKiU3Bo3bNJyHl0YlCdphu1Yk8oOOE+I6EeIaEeIaEeIaEeIaEeIb3QoARQG96ufxsCXelHwc2AhMjD/BaCLAAuEs1vAO2FpU9OCHprUafqZ7DReQPSggwAXhFfax2XUNoQvZQL7dd1xCakJvUT7frOkIS8pH66XVdR0hCTMSutX0/n5IQMxLSUN9E7Fq7aR4JaTGUhGRgGyQhJSEhZiSkob6J2LV20zwS0mIoCcnANkhCSkJCzEhIQ30TsWvtpnkkpMVQEpKBbZCElISEmJGQhvomYtfaTfNISIuhJCSD2lprWGrHrrVDFWJrPrOngFASkoFt0EzMPAbGO4YyEbvUDVZIOvC+ZTE3gGV5G5hJSDZDDdyPG8YFW8bEBS8+KCETgbcS4tEzkEl3AQmpUEiLvdvztoqVkBxCnlAeEpJDSNKFpiwkJIeQ7ZRH2wrh31YYMywPGhXZWuO3kKnAJ7f9nmvBvgtpZK/hNbMpmD+FD1AOoQh5mjzPkvGa0xTMn8KjgctFFw9ICGnfxp7kkhEwqwwZCY0BppTQLDIkIVXwoTlEV/oUbFF/aSQh/8c1U5hFaROwD7ghIf/HrqEWMyo9kliZ8/BuuqX2V0Oop5YrBj2GWl2WMRctO6DPIyHPXX/ScAJ4mCP0SUOtFTl3wnxLvipJTjuWRHUCnMoR/FvyS2ZGS9h7OWq9Tk7sLPmq4hYwL6obYA7wPaeU/rRVxj7gWc4dYf0PlBLaezRuyQXdQ8ByYHjkC2nf8zq4kpx71b1+70haa6dS8nxS8jIwZJ/1Tic9kutPv+i/UDwvkq7R6ZGfub+6EEIIIYQQQgghRNTIL4plgK07uZydAAAAAElFTkSuQmCC'
        }, ...parameters]
    }

    const [selected, setSelected] = React.useState([])

    const [localJson, setLocalJson] = React.useState(json)

    const [counter, setCounter] = React.useState(0)
    return (
        <div className={style['container']} style={{
            height: String(window.innerHeight) + 'px',
            marginTop: String(-tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
        }}>
            <div>
                <div onClick={onClose}/>
                <div style={{bottom: '37vw'}}>
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
                                <div
                                    className={style['arrow'] + ' ' + style[selected.indexOf(index) !== -1 ? 'selectedArrow' : '']}/>
                            </div>
                            <>{param.list.map(element => (
                                <div style={{height: selected.indexOf(index) !== -1 ? '9vw' : 0}}
                                     onClick={() => {
                                         let newJson = json
                                         let item = typeof element.value === 'undefined' ? element.label : element.value

                                         if (!localJson[param.type].includes(item)) {
                                             newJson[param.type].push(item)
                                         } else {
                                             newJson[param.type] = newJson[param.type].filter((pos) => pos !== item)
                                         }
                                         setJson(newJson)
                                         setLocalJson(newJson)
                                         setCounter(counter + 1)
                                     }}>
                                    <input type="checkbox" checked={localJson[param.type].includes((typeof element.value === 'undefined' ? element.label : element.value))}
                                           onChange={() => {
                                           }}/>
                                    <p>
                                        {element.label}
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

                <button onClick={() => {
                    let newJson = json
                    parameters.map((param, index) => {
                        newJson[param.type] = []
                    })
                    setLocalJson(newJson)
                    setJson(newJson)
                    onClose()
                }
                }>
                    Сбросить фильтры
                </button>
            </div>
        </div>);
};


export default Filter;