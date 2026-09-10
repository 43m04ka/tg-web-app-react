import React from 'react';
import {Panel, Workspace} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import MediaBrowser from './MediaBrowser';

export default function MediaScreen() {
    usePageHeader('Хостинг');

    return (
        <Workspace>
            <Panel scroll>
                <MediaBrowser/>
            </Panel>
        </Workspace>
    );
}
