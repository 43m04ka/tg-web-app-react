import React, {useState} from 'react';
import PopUpWindow from "../../Elements/PopUpWindow/PopUpWindow";
import InputLabel from "../../Elements/Input/InputLabel";
import style from './InfoBlock.module.scss';
import useData from "../../useData";
import {useServer} from "./useServer";

const CreateInfoBlock = ({onClose, setPromoList}) => {

    const [inputNameCreate, setInputNameCreate] = useState('')
    const [inputBodyCreate, setInputBodyCreate] = useState('')
    const [inputPathCreate, setInputPathCreate] = useState('')
    const [infoLabel, setInfoLabel] = useState('*Поля обязательные для заполнения')

    const {authenticationData} = useData();
    const {getInfoBlock, createInfoBlock} = useServer()

    return (
        <PopUpWindow title={'Создать промокод'}>
            <div>
                <InputLabel onChange={(e) => {
                    setInputNameCreate(e.target.value)
                }} label={'*Имя'}/>
                <InputLabel onChange={(e) => {
                    setInputBodyCreate(e.target.value)
                }} label={'*Тело блока'}/>
                <InputLabel onChange={(e) => {
                    setInputPathCreate(e.target.value)
                }} label={'*Ссылка'}/>
            </div>
            <div className={style['infoLabel']}>
                {infoLabel}
            </div>
            <div className={style['buttonPlace']}>
                <div className={style['buttonAccept']} onClick={async () => {

                    await createInfoBlock(authenticationData, {
                        name: inputNameCreate,
                        body: inputBodyCreate,
                        path: inputPathCreate,
                    }).then(()=> getInfoBlock(setPromoList).then())
                    onClose();
                }}>
                    <div/>
                    <p>Создать</p>
                </div>

                <div className={style['buttonCancel']} onClick={() => {
                    onClose();
                }}>
                    <div/>
                    <p>Отмена</p>
                </div>
            </div>
        </PopUpWindow>
    );
};

export default CreateInfoBlock;