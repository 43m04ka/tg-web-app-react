import React from 'react';
import {EmptyState, Panel, Workspace} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';

export default function MarketplaceScreen() {
    usePageHeader('Маркетплейсы');

    return (
        <Workspace>
            <Panel scroll title="Заявки с маркетплейсов">
                <EmptyState title="Скоро" text="Заявки приходят сообщением в Telegram"/>
            </Panel>
        </Workspace>
    );
}
