import React from 'react';
import {Panel, Workspace} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import MediaBrowser from './MediaBrowser';

export default function MediaScreen() {
    usePageHeader('Хостинг');

    return (
        <Workspace>
            <Panel
                title="Файлы витрины"
                subtitle="Картинки брендов, баннеров и карточек"
                scroll
            >
                <MediaBrowser/>
            </Panel>
        </Workspace>
    );
}
