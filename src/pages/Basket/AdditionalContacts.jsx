import React from 'react';
import ContactField from './ContactField';
import {CONTACT_CHANNELS, formatContact, isContactValid} from './cartModel';

export const activeContacts = (contacts, primary) => contacts.filter((item) => item.channel !== primary);
export const additionalContactsValid = (contacts, primary) => activeContacts(contacts, primary)
    .every((item) => isContactValid(item.channel, item.value));
export const additionalContactsText = (contacts, primary) => activeContacts(contacts, primary)
    .map((item) => formatContact(item.channel, item.value));

export default function AdditionalContacts({contacts, primary, onChange, isTouched, styles}) {
    const active = activeContacts(contacts, primary);
    const options = CONTACT_CHANNELS.filter((item) => ['telegram', 'whatsapp', 'phone'].includes(item.key)
        && item.key !== primary && !contacts.some((contact) => contact.channel === item.key));
    return <div className={styles.contact}>
        {active.map((item) => <ContactField key={item.channel} channel={item.channel} value={item.value}
            isTouched={isTouched} hideChannels styles={styles}
            onChange={(value) => onChange(contacts.map((contact) => contact.channel === item.channel ? {...contact, value} : contact))}/>)}
        {options.length ? <div className={styles.additionalChannels}>
            {options.map((item) => <button type="button" key={item.key} className={styles.channel}
                onClick={() => onChange([...contacts, {channel: item.key, value: ''}])}>+ Добавить {item.title}</button>)}
        </div> : null}
    </div>;
}
