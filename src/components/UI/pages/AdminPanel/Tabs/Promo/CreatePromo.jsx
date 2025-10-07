import React, {useState} from 'react';
import PopUpWindow from "../../Elements/PopUpWindow/PopUpWindow";
import InputLabel from "../../Elements/Input/InputLabel";
import style from './Promo.module.scss';
import useData from "../../useData";
import {useServer} from "./useServer";

const CreatePromo = ({onClose, setPromoList}) => {

    const [inputNameCreate, setInputNameCreate] = useState(null)
    const [inputPercentCreate, setInputPercentCreate] = useState(null)
    const [inputPersonalNumCreate, setInputPersonalNumCreate] = useState(null)
    const [inputGlobalNumCreate, setInputGlobalNumCreate] = useState(null)
    const [infoLabel, setInfoLabel] = useState('*Поля обязательные для заполнения')

    const {authenticationData} = useData();
    const {getPromoList, createPromo} = useServer()

    return (
        <PopUpWindow title={'Создать промокод'}>
            <div>
                <InputLabel onChange={(e) => {
                    setInputNameCreate(e.target.value.toUpperCase())
                }} label={'*Имя'} placeholder={'NEWPROMO2025'}/>
                <InputLabel onChange={(e) => {
                    setInputPercentCreate(Number(e.target.value))
                }} label={'*Процент скидки'} placeholder={'3'}/>
                <InputLabel onChange={(e) => {
                    setInputGlobalNumCreate(Number(e.target.value))
                }} label={'Общее кол-во использований'} placeholder={'1000'}/>
                <InputLabel onChange={(e) => {
                    setInputPersonalNumCreate(Number(e.target.value))
                }} label={'Персональное кол-во использований'} placeholder={'3'}/>
            </div>
            <div className={style['infoLabel']}>
                {infoLabel}
            </div>
            <div className={style['buttonPlace']}>
                <div className={style['buttonAccept']} onClick={async () => {

                    await createPromo(authenticationData, {
                        name: inputNameCreate,
                        percent: inputPercentCreate,
                        totalNumberUses: inputGlobalNumCreate,
                        personalNumberUses: inputPersonalNumCreate
                    }).then(()=> getPromoList(authenticationData, setPromoList).then())
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

export default CreatePromo;