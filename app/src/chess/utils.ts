import { ColorType } from "./types";

export const file_to_index = (file: string): number => {
    return file.charCodeAt(0) - 'a'.charCodeAt(0);
}

export const invert_color = (color: ColorType): ColorType => {
    return color === ColorType.White ? ColorType.Black : ColorType.White;
}