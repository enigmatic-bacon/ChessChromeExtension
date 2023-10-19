
export const file_to_index = (file: string): number => {
    return file.charCodeAt(0) - 97;
}