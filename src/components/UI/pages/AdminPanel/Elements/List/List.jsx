import React from 'react';
import style from './List.module.scss';
import ThreePoint from "./ThreePoint";

const List = ({listData, cap, positionOptions, returnOption, setSelectList, selectList}) => {

    return (
        <div className={style['listScrollY']}>
            <div className={style['listScrollYCap']}  style={{gridTemplateColumns: '20px ' + '1fr '.repeat(cap['key'].length) + '35px'}}>
                <input className={style['checkboxInput']} type='checkbox'
                       checked={selectList.length === listData.length && selectList.length > 0}
                       onChange={(event)=>{
                           if (event.target.checked) {
                               let idList = listData.map(item => {
                                   return item.id
                               });
                               setSelectList(idList)
                           }else{
                               setSelectList([])
                           }
                       }}/>
                {cap['name'].map((item) => (
                    <div>{item}</div>
                ))}
            </div>
            <div className={style['listBody']}>
                {listData.map((item, index) => (
                    <div className={style['listScrollYElement-' + index % 2]} style={{gridTemplateColumns: '20px ' + '1fr '.repeat(cap['key'].length) + '35px'}}>
                        <input className={style['checkboxInput']} type='checkbox'
                               checked={selectList.includes(item.id)}
                        onChange={(event)=>{
                            let elementIndex = selectList.indexOf(item.id)

                            if (event.target.checked && elementIndex === -1) {
                                setSelectList([...selectList, item.id])
                            }else if(!event.target.checked && elementIndex !== -1){
                                setSelectList(selectList.splice(selectList.indexOf(item.id)+1, 1))
                            }
                        }}/>
                        {cap['key'].map(key => (
                            <div>{item[key]}</div>
                        ))}
                        <ThreePoint positionOptions={positionOptions} returnOption={(option)=>{returnOption(option, item.id)}}/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default List;