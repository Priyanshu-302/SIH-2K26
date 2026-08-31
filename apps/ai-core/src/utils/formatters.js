export function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n+/g, '\n\n')
        .trim();
}

export function parseCitationsFromText(text) {
    if (!text) return [];
    const regex = /\[Doc\s+(\d+)\]/gi;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        const idx = parseInt(match[1], 10);
        if (!matches.includes(idx)) {
            matches.push(idx);
        }
    }
    return matches.sort((a, b) => a - b);
}
