import React from 'react';
import styles from './NavigationBar.module.scss';
import {useNavigate} from "react-router-dom";
import {useServer} from "../useServer";
import useData from "../useData";
import DictionaryList from "./ProcessBlock/DictionaryList";

const NavigationBar = ({routeData}) => {
    const navigator = useNavigate();
    const {updateAssociations} = useServer()
    const {authenticationData} = useData()

    return (<div className={styles['main-division']}>
        <div>
            <div>
                {routeData.map(routeList => (<div>
                    {routeList.map((label) => (
                        <div onClick={() => navigator(label.path)} key={label.path} className={`${styles['label']}
                           ${styles[window.location.pathname.replace('/admin-panel/', '') === label.path ? 'active' : '']}`}>
                            {label.name}
                        </div>))}
                </div>))}
            </div>
        </div>
        <DictionaryList/>
        <button className={styles['buttonUpdate']} onClick={() => {
            updateAssociations(authenticationData).then()
        }}>{'Обновить асоциации'}</button>
    </div>);
};

export default NavigationBar;