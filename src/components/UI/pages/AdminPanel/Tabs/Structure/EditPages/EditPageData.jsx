import React, {useState} from 'react';
import style from '../Structure.module.scss'
import useData from "../../../useData";
import {useServer} from "../useServer";
import PopUpWindow from "../../../Elements/PopUpWindow/PopUpWindow";
import InputLabel from "../../../Elements/Input/InputLabel";
import useGlobalData from "../../../../../../../hooks/useGlobalData";
import SwitchLabel from "../../../Elements/SwitchLabel/SwitchLabel";

const EditPageData = ({onClose, updatePageList, id}) => {

    const {pageList} = useGlobalData();
    let pageData = {}
    pageList.map((item) => {
        if(item.id === id){
            pageData = item;
        }
    })
    const [infoLabel, setInfoLabel] = useState('*Поля обязательные для заполнения')
    const [updatePageJson, setUpdatePageJson] = useState({})

    const {authenticationData} = useData();
    const {updatePageData} = useServer()

    return (
        <PopUpWindow title={'Редактировать страницу'}>
            <div>
                <InputLabel label={'Имя'} defaultValue={pageData.name}
                            onChange={(e) => {
                                let newJson = updatePageJson
                                newJson['name'] = e.target.value;
                                setUpdatePageJson(newJson);
                            }}/>
                <InputLabel label={'Ссылка'} defaultValue={pageData.link}
                            onChange={(e) => {
                                let newJson = updatePageJson
                                newJson['link'] = e.target.value;
                                setUpdatePageJson(newJson);
                            }}/>
                <InputLabel label={'Изображение'} defaultValue={pageData.url}
                            onChange={(e) => {
                                let newJson = updatePageJson
                                newJson['url'] = e.target.value;
                                setUpdatePageJson(newJson);
                            }}/>
                <InputLabel label={'Порядковый номер'} defaultValue={pageData.serialNumber}
                            onChange={(e) => {
                                let newJson = updatePageJson
                                newJson['serialNumber'] = e.target.value;
                                setUpdatePageJson(newJson);
                            }}/>
                <InputLabel label={'Цвет'} defaultValue={pageData.color}
                            onChange={(e) => {
                                let newJson = updatePageJson
                                newJson['color'] = e.target.value;
                                setUpdatePageJson(newJson);
                            }}/>
                <InputLabel label={'Заголовок в сообщении'} defaultValue={pageData.titleForMassage}
                            onChange={(e) => {
                                let newJson = updatePageJson
                                newJson['titleForMassage'] = e.target.value;
                                setUpdatePageJson(newJson);
                            }}/>
                <SwitchLabel label={'Отображение страницы в боте'} defaultValue={pageData.isHide}
                            onChange={(e) => {
                                let newJson = updatePageJson
                                newJson['isHide'] = e.target.checked ? 1 : 0;
                                setUpdatePageJson(newJson);
                            }}/>
            </div>
            <div className={style['infoLabel']}>
                {infoLabel}
            </div>
            <div className={style['buttonPlace']}>
                <div className={style['buttonAccept']} onClick={async () => {
                    await updatePageData(authenticationData, id, updatePageJson)
                    await updatePageList()
                    onClose();
                }}>
                    <div/>
                    <p>Сохранить</p>
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

export default EditPageData;