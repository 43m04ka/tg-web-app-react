export const ICON_SIZE = 192;

export const shrinkImage = (file, size = ICON_SIZE) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Файл не прочитался'));
    reader.onload = () => {
        const image = new Image();

        image.onerror = () => reject(new Error('Это не картинка'));
        image.onload = () => {
            const scale = Math.min(1, size / Math.max(image.width, image.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));

            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
        };

        image.src = reader.result;
    };

    reader.readAsDataURL(file);
});
