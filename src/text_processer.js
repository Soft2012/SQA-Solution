import axios from 'axios';

const MAX_WORD_SIZE = 50;

export const optimizeDocument = (document) => {
    // Replace one or more spaces or tabs with a single space
    document = document.replace(/[ \t]+/g, ' ');

    // Replace two or more newlines with a single newline
    document = document.replace(/\n{3,}/g, '\n\n');

    return document;
}

export const segmentSection = (section) => {
    const sentences = section.split('\n')
    let chunk_size = 0
    const chunks = [];
    let current_chunk = "";

    for (const sentence of sentences)
    {
        const word_size = sentence.split(' ').length
        if (chunk_size > MAX_WORD_SIZE)
        {
        chunks.push(current_chunk)
        current_chunk = sentence + "\n"
        chunk_size = word_size
        
        }
        else
        {
        current_chunk += sentence + "\n"
        chunk_size += word_size
        }

    }

    if (current_chunk.length > 0) {
        chunks.push(current_chunk);
    }

    return chunks
}
