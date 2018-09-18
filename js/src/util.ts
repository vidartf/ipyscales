
export function capitalize(str: string) {
    return str.replace(/^\w/, c => c.toUpperCase());
}

export function unCapitalize(str: string) {
    return str.replace(/^\w/, c => c.toLowerCase());
}
