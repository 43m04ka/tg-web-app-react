import React from 'react';
import {Link} from "react-router-dom";
import {useTelegram} from "../../hooks/useTelegram";

const Search = ({data, height}) => {
    const [listRes, setListRes] = React.useState([]);
    const [status, setStatus] = React.useState(0);
    const {tg} = useTelegram();

    const onChangeEmpty = (event) => {
        const valueInput = event.target.value
        const category = [...data.body[1], ...data.body[0]]

        let allCard = []
        category.map(el => {
            const array = el.body
            array.map(card => {
                card.path = el.path
                allCard = [...allCard, card]
            })
        })
        let result = []
        allCard.map(card => {
            if (card.title.toLowerCase().includes(valueInput.toLowerCase())) {
                result = [...result, card]
            }
        })

        if (valueInput.length > 2) {
            if (result.length === 0) {
                setStatus(2)
            } else {
                setStatus(1)
                setListRes(result)
            }
        } else {
            setStatus(0)
            setListRes([])
        }

        console.log(result)
    }
    console.log(data)

    if (status === 1) {
        return (
            <div>
                <div style={{borderBottom: '2px gray solid'}}>
                    <input className={'search'} onChange={onChangeEmpty}
                           style={{width: String(window.innerWidth - 20) + 'px',}}></input>
                </div>
                <div className={'scroll-container-y'} style={{height: String(height - 70) + 'px'}}>
                    {listRes.map((item) => (
                        <div className={'list-element'}
                             style={{marginLeft: String((window.innerWidth - 160 - 160) / 3) + 'px'}}>
                            <Link to={'/home/' + item.path + '/' + item.id} className={'link-element'}>
                                <div className={'box-item-basket'}>
                                    <img src={item.img} alt={item.title} className={'img'}/>
                                    <div className={'box-grid-row'}>
                                        <div className={'text-element text-basket'}>{item.price + ' ₽'}</div>
                                        <div className={'text-element text-basket'}>{item.title}</div>
                                    </div>
                                </div>
                            </Link>
                        </div>))}
                </div>
            </div>
        );
    }
    else if(status === 2) {
        return (
            <div>
                <div style={{borderBottom: '2px gray solid'}}>
                    <input className={'search'} onChange={onChangeEmpty}
                           style={{width: String(window.innerWidth - 20) + 'px'}}></input>

                </div>
                <div style={{
                    height: String(height - 100 - 15 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                    marginTop: '15px', marginLeft: String(window.innerWidth / 2 - 60) + 'px',
                    color: 'gray'
                }} className={'text-element'}>
                    Нет результатов
                </div>
            </div>
        );
    } else if (status === 0) {
        return (
            <div>
                <div style={{borderBottom: '2px gray solid'}}>
                    <input className={'search'} onChange={onChangeEmpty}
                           style={{width: String(window.innerWidth - 20) + 'px',}}></input>

                </div>
                <div style={{
                    marginTop: '15px', marginLeft: String(window.innerWidth / 2 - 65) + 'px',
                    color: 'gray'
                }} className={'text-element'}>
                    Начните вводить
                </div>
            </div>
        );
    }
}

export default Search;