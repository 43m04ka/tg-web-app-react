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

export const isVideoFile = (file) => file.type.startsWith('video/');
