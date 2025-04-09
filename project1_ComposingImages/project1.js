// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgImg, fgImg, fgOpac, fgPos) {
    console.log(bgImg)
    const bgData = bgImg.data;
    const fgData = fgImg.data;

    for (let y = 0; y < fgImg.height; y++) {
        for (let x = 0; x < fgImg.width; x++) {
            const bgX = x + fgPos.x;
            const bgY = y + fgPos.y;

            if (bgX < 0 || bgY < 0 || bgX >= bgImg.width || bgY >= bgImg.height) {
                continue; // Ignore pixels outside the background image
            }

            const fgIndex = (y * fgImg.width + x) * 4;
            const bgIndex = (bgY * bgImg.width + bgX) * 4;

            const fgAlpha = (fgData[fgIndex + 3] / 255) * fgOpac;
            const invAlpha = 1 - fgAlpha;

            bgData[bgIndex] = fgData[fgIndex] * fgAlpha + bgData[bgIndex] * invAlpha;      // Red
            bgData[bgIndex + 1] = fgData[fgIndex + 1] * fgAlpha + bgData[bgIndex + 1] * invAlpha; // Green
            bgData[bgIndex + 2] = fgData[fgIndex + 2] * fgAlpha + bgData[bgIndex + 2] * invAlpha; // Blue
            bgData[bgIndex + 3] = (fgAlpha + bgData[bgIndex + 3] / 255 * invAlpha) * 255; // Alpha
        }
    }
}
