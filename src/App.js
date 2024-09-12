import React, { useState } from 'react';
import axios from 'axios';
import Mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import {optimizeDocument, segmentSection} from './text_processer.js';
import './App.css';
import TypingEffect from "./TypingEffect.jsx"

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
      let content = '';

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        content += strings.join('\n');
      }
      setFileContent(content);
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
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        try {
          const response = await axios.post('https://sqa-backend.vercel.app/test', {chunk});
          setText(response.data.text)
        } 
        catch (error) {
          setLoading(false);
          console.error('Error calling ChatGPT API:', error.response ? error.response.data : error.message);
        }
      }
      
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
                <TypingEffect text = {text} speed = {5}/>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default App;