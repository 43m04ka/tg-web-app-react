export const CAPTION_LIMIT = 1024;
export const TEXT_LIMIT = 4096;

/** Черновик: текст, одно медиа, опционально inline-клавиатура (ряды кнопок). */
export const emptyDraft = () => ({
    captionHtml: '',
    media: null,
    keyboardRows: [],
});

export const nextId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const COMMON_EMOJI = ['👍', '🔥', '❤️', '😀', '😊', '🎉', '✅', '⚠️', '📌', '🛒', '💳', '📦'];

export const CUSTOM_EMOJI_LIST = [
    { id: '5418197073214338067', fallback: '💙' },
    { id: '5418089729096707864', fallback: '💙' },
    { id: '5418023908722898371', fallback: '💙' },
    { id: '5418215447084430482', fallback: '💙' }
];


export const isVideoFile = (file) => file.type.startsWith('video/');
