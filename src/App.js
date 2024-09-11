import React, { useState } from 'react';
import Mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import {optimizeDocument, segmentSection, generatePrompt, chatgptAPIRequest} from './openaiService.js';
import './App.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);  

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const file = event.target.files[0];

    if (!file) {
      alert('Please upload a file first.');
      return;
    }

    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'pdf') {
      extractTextFromPDF(file);
    } else if (fileType === 'docx' || fileType === 'doc') {
      extractTextFromDOCX(file);
    } else if (fileType === 'txt') {
      extractTextFromTXT(file);
    } else {
      alert('Unsupported file type.');
    }
  };

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();
    reader.onload = async function () {
      const typedarray = new Uint8Array(this.result);

      const pdf = await pdfjsLib.getDocument({data: typedarray}).promise;
      let text = '';

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        text += strings.join(' ');
      }
      setFileContent(text);
    };
    reader.readAsArrayBuffer(file);
  };

  const extractTextFromDOCX = async (file) => {
    const reader = new FileReader();
    reader.onload = async function (event) {
      const arrayBuffer = event.target.result;
      try {
        const result = await Mammoth.extractRawText({arrayBuffer: arrayBuffer});
        setFileContent(result.value);
      } catch (e) {
        console.error('Error extracting text from DOCX:', e);
        alert('Error extracting text from DOCX.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const extractTextFromTXT = (file) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      setFileContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleClear = () => {
    setText("");
    setFileContent("");
    setFile("")
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', text);
    try {
      setLoading(true);
      
      const chunks = segmentSection(optimizeDocument(fileContent))
      const allTestCases = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const prompt = generatePrompt(chunk)

        try {
            const test_cases = await chatgptAPIRequest(prompt)
            allTestCases.push(test_cases);
        } 
        catch (error) {
            console.error('Error calling ChatGPT API:', error.response ? error.response.data : error.message);
            //console.log("API_KEY ----- ", API_KEY)
        }
      }
      
      const test_case_list = []
      for (const test_case of allTestCases)
      {
        console.log(test_case)
        const json_obj = JSON.parse(test_case);
        const child_list = json_obj["test_cases"]
        for (const one_child of child_list)
        {
          test_case_list.push(one_child);
        }
      }
      
      let out_put_string = `Total Count : ${test_case_list.length}\n\n`
      let id = 1
      for (const test_case of test_case_list)
      {
        let test_step_string = ""
        const test_step = test_case["Test Steps"]
        let step_id = 1
        for (const step of test_step)
        {
          test_step_string += `${step_id}. ` + step + ".\n"
          step_id++
        }

        out_put_string += (
          `Test Case ${id}\n` +
          `Title: ${test_case["Title"]}\n` +
          `Description: ${test_case["Description"]}\n` +
          `Test Steps:\n${test_step_string}` +
          `Expected Outcome: ${test_case["Expected Outcome"]}\n` +
          `Priority: ${test_case["Priority"]}\n\n`)
          
        id++;
      }
        
      allTestCases.join("\n");
      setText(out_put_string)
     
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('Error uploading the file and text', error);
    }
  };

  return (
    <div className="App">
      {loading && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}
      <h1>AUTOMATIC TEST CASE GENERATION (DEMO)</h1>
      <form>
        <div style={{ display: 'flex', width: '100%' }}>
            <input type="file" onChange={handleFileChange} className="input" />
            <button type="submit" className="button" onClick={handleSubmit}>Start</button>
            <button type="submit" className="button" onClick={handleClear}>Clear</button>
        </div>
        <div className="form-group">
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ width: '50%', paddingRight: '15px', textAlign: 'center'}}>
              PRD
              <label className="label">
                <textarea 
                  rows={20} 
                  value={fileContent} 
                  onChange={(e) => setFileContent(e.target.value)}
                  className="textarea" 
                  style={{ width: '100%' }} 
                />
              </label>
            </div>
            <div style={{ width: '50%', paddingLeft: '15px', textAlign: 'center'}}>
              Test Cases
              <label className="label">
                <textarea 
                  rows={20} 
                  value={text} 
                  onChange={handleTextChange} 
                  className="textarea" 
                  style={{ width: '100%' }} 
                />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default App;