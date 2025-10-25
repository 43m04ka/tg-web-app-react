import React, {useState} from 'react';
import EditPages from "./EditPages/EditPages";
import style from './Structure.module.scss'
import EditCatalogs from "./EditCatalogs/EditCatalogs";

const Structure = () => {

    const [page, setPage] = useState(-1)

    return (
        <div className={[style['structureMainContainer']]}>
            <EditPages/>
            {page > 0 ?  <EditCatalogs page={page}/> : ''}
        </div>
    );
};

export default Structure;