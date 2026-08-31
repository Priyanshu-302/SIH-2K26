import { cleanText } from '../utils/formatters.js';

export function splitLegalText(text, sourceName = '') {
    const cleaned = cleanText(text);
    const sectionRegex = /(?:^|\n)(Section\s+\d+\(?[a-zA-Z0-9]*\)?|Clause\s+\d+)/gi;

    const splitIndices = [];
    let match;

    while ((match = sectionRegex.exec(cleaned)) !== null) {
        splitIndices.push({
            index: match.index,
            title: match[1].trim()
        });
    }

    if (splitIndices.length === 0) {
        return chunkByLength(cleaned, 'General', sourceName);
    }

    const chunks = [];
    for (let i = 0; i < splitIndices.length; i++) {
        const start = splitIndices[i].index;
        const end = (i + 1 < splitIndices.length) ? splitIndices[i + 1].index : cleaned.length;
        const sectionText = cleaned.substring(start, end).trim();
        const sectionName = splitIndices[i].title;

        if (sectionText.length > 1200) {
            const subParts = chunkText(sectionText, 1000, 200);
            subParts.forEach((part, subIdx) => {
                chunks.push({
                    text: part,
                    section: sectionName,
                    title: `${sectionName} (Part ${subIdx + 1})`
                });
            });
        } else if (sectionText.length > 5) {
            chunks.push({
                text: sectionText,
                section: sectionName,
                title: sectionName
            });
        }
    }

    return chunks.map((chunk, idx) => ({
        ...chunk,
        chunkIndex: idx
    }));
}

function chunkByLength(text, sectionName, sourceName) {
    const parts = chunkText(text, 1000, 200);
    return parts.map((part, idx) => ({
        text: part,
        section: sectionName,
        title: `${sourceName || 'Document'} - Part ${idx + 1}`,
        chunkIndex: idx
    }));
}

function chunkText(text, chunkSize, overlap) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        const end = Math.min(i + chunkSize, text.length);
        chunks.push(text.substring(i, end));
        if (end === text.length) break;
        i += (chunkSize - overlap);
    }
    return chunks;
}
