export default class Helper {
    constructor() { }

    static PathToImg(path: string): HTMLImageElement {
        let img: HTMLImageElement = new Image();
        img.src = path;
        return img
    }

    static PathsToImgs(paths: string[]): HTMLImageElement[] {
        let imgs: HTMLImageElement[] = [];
        for (const path of paths) {
            const img: HTMLImageElement = new Image();
            img.src = path;
            imgs.push(img)
        }
        return imgs
    }
}
