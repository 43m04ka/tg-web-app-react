const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:');

export const START_PAGE_DEFAULTS = {
    title: 'Выберите платформу',
    label: 'У вас будет всегда возможность сменить платформу',
};

export function decodeStartPageContent(item) {
    const img = item?.img || '';

    if (item?.type === 'label') {
        if (isDataUrl(img)) {
            return {text: '', icon: img};
        }
        return {text: img, icon: ''};
    }

    if (item?.type === 'title') {
        if (!img) {
            return {text: START_PAGE_DEFAULTS.title, icon: ''};
        }

        if (img.startsWith('{')) {
            try {
                const parsed = JSON.parse(img);
                return {
                    text: parsed.text || parsed.t || START_PAGE_DEFAULTS.title,
                    icon: parsed.icon || parsed.i || '',
                };
            } catch {
                // fall through
            }
        }

        if (isDataUrl(img)) {
            return {text: START_PAGE_DEFAULTS.title, icon: img};
        }

        return {text: img, icon: ''};
    }

    if (item?.type === 'page') {
        return {icon: img || ''};
    }

    return {text: '', icon: ''};
}

export function encodeStartPageContent(type, {text, icon}) {
    if (type === 'label') {
        return (text || '').trim();
    }

    if (type === 'title') {
        const normalizedText = (text || '').trim();
        const normalizedIcon = icon || '';

        if (normalizedText && normalizedIcon) {
            return JSON.stringify({text: normalizedText, icon: normalizedIcon});
        }
        if (normalizedIcon) {
            return normalizedIcon;
        }
        return normalizedText;
    }

    if (type === 'page') {
        return icon || '';
    }

    return '';
}

export async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
