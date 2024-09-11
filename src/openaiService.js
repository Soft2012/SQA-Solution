import axios from 'axios';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY
const API_URL = 'https://api.openai.com/v1/chat/completions';
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

export const generatePrompt = (chunk) => {
    const description = (
        `Please carefully analyze the attached Product Requirement Document and generate a comprehensive set of test cases.\n` + 
        `Each test case should include the following information:\n\n` +
        `Title: A brief description of what the test case is verifying.\n` +
        `Objective: The goal or purpose of the test case.\n` +
        `Prerequisites: Any setup or conditions that must be met before executing the test case.\n` +
        `Test Data: Specific data inputs required for the test case.\n` +
        `Steps to Execute: A detailed sequence of actions to perform.\n` +
        `Expected Results: The anticipated outcome of the test case after execution.\n` +
        `Please ensure that your test cases cover all the functionalities and scenarios outlined in the Product Requirement Document.\n` + 
        `Generate a lot of test cases as possible.\n\n`
    );

    const prompt = (
        `${description}` +
        `Generate test cases for the following functionality described in this document:\n\n` +
        `${chunk}\n\n`
    );

    const user_prompt = (
        `Please carefully analyze the attached Product Requirement Document and generate a comprehensive set of test cases.\n` + 
        `Please ensure that your test cases cover all the functionalities and scenarios outlined in the Product Requirement Document.\n` + 
        `Generate test cases more than 20 for the following functionality described in this document:\n\n` +
        `${chunk}\n`)
    return user_prompt;
};

export const chatgptAPIRequest = async (user_prompt) => {
    const system_prompt = (`You are an AI assistant tasked with generating test cases from Product Requirements Documents (PRDs) for a software quality assurance (SQA) project.\n` + 
        `Your goal is to produce comprehensive, accurate, and well-structured test cases.\n` +
        `you must generate exactly a lot of test cases as possible.\n` +
        `Generate with Json format like below.(allowing Json Grammar):\n\n` +
        `{\n` +
        `"test_cases": [\n` +
            `{\n` +
            `"Title": "xxx",\n` +
            `"Description": "xxx",\n` +
            `"Preconditions": "xxx",\n` +
            `"Test Steps": [\n` +
                `"xxx",\n` +
                `"xxx"\n` +
            `],\n` +
            `"Expected Results": "xxx",\n` +
            `"Priority": "xxx"\n` +
            `},\n` +
            `{\n` +
            `"Title": "xxx",\n` +
            `"Description": "xxx",\n` +
            `"Preconditions": "xxx",\n` +
            `"Test Steps": [\n` +
                `"xxx",\n` +
                `"xxx"\n` +
            `],\n` +
            `"Expected Results": "xxx",\n` +
            `"Priority": "xxx"\n` +
            `},\n` +
        `]\n` +
        `}\n\n` +
        `The test cases should cover all functionalities described in the PRD, including positive, negative, edge cases, and boundary conditions.\n`)

    const response = await axios.post(
        API_URL,
        {
        model: 'gpt-3.5-turbo', // Specify the model
        messages: [
            { role: "system", content: system_prompt },
            { role: "user", content: user_prompt }
        ],
        max_tokens: 3500, // Limit the response length (adjust as needed)
        temperature: 0.7, // Controls the randomness of the output (adjust as needed)
        },
        {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
        }
    );

    console.log(system_prompt)
    console.log(user_prompt)

    return response.data.choices[0].message.content;
}