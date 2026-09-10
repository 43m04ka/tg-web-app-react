import {API_BASE_URL} from '../../../shared/config/env';
import {getToken, reportUnauthorized} from './token';

const RETRY_MS = 5000;

export const parseChunk = (buffer) => {
    const parts = buffer.split('\n\n');
    const tail = parts.pop();

    const events = parts
        .map((block) => {
            const lines = block.split('\n');
            const name = (lines.find((line) => line.startsWith('event: ')) || '').slice(7).trim();
            const raw = lines
                .filter((line) => line.startsWith('data: '))
                .map((line) => line.slice(6))
                .join('\n');

            if (!name || !raw) return null;

            try {
                return {event: name, data: JSON.parse(raw)};
            } catch {
                return null;
            }
        })
        .filter(Boolean);

    return {events, tail};
};

export function openEventStream({onState, onOpen, onClose}) {
    let stopped = false;
    let controller = null;
    let retryId = null;

    const retry = () => {
        if (stopped) return;

        clearTimeout(retryId);
        retryId = setTimeout(connect, RETRY_MS);
    };

    async function connect() {
        if (stopped) return;

        const token = getToken();
        if (!token) {
            retry();
            return;
        }

        controller = new AbortController();

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/events`, {
                headers: {Authorization: `Bearer ${token}`, Accept: 'text/event-stream'},
                signal: controller.signal,
            });

            if (response.status === 401) {
                reportUnauthorized();
                stopped = true;
                return;
            }

            if (!response.ok || !response.body) {
                onClose?.();
                retry();
                return;
            }

            onOpen?.();

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            for (;;) {
                const {value, done} = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, {stream: true});

                const {events, tail} = parseChunk(buffer);
                buffer = tail;

                events.forEach((item) => {
                    if (item.event === 'state') onState?.(item.data);
                });
            }

            onClose?.();
            retry();
        } catch (error) {
            if (stopped || controller?.signal.aborted) return;

            onClose?.();
            retry();
        }
    }

    connect();

    return () => {
        stopped = true;
        clearTimeout(retryId);
        controller?.abort();
    };
}
