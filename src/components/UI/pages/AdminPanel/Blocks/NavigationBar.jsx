import React from 'react';
import styles from './NavigationBar.module.scss';
import {useNavigate} from "react-router-dom";
import ButtonLabel from "../Elements/ButtonLabel";
import {useServer} from "../useServer";
import useData from "../useData";

const NavigationBar = ({routeData}) => {
    const navigator = useNavigate();
    const {updateAssociations} = useServer()
    const {authenticationData} = useData()

    return (
        <div className={styles['main-division']}>
            <div>
                {routeData.map(routeList => (
                <div className={styles['block']}>
                    {routeList.map((label) =>
                        (<div onClick={() => navigator(label.path)} key={label.path} className={`${styles['label']}
                           ${styles[window.location.pathname.replace('/admin-panel/', '') === label.path ? 'active' : '']}`}>
                            {(window.location.pathname.replace('/admin-panel/', '') === label.path ? '» ' : '') + label.name}</div>)
                    )}
                </div>
            ))}
            </div>
            <ButtonLabel label={'Обновить асоциации'} onClick={()=>{updateAssociations(authenticationData).then()}}/>
        </div>
    );
};

export default NavigationBar;