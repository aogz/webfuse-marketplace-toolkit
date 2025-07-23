import React, { useState } from 'react';
import './Page.css';

const Import = ({ domain }) => {
    const [apiKey, setApiKey] = useState('');
    const [userId, setUserId] = useState('');
    const [jsonContent, setJsonContent] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState('');

    const API_BASE_URL = `https://${domain}/api`;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedJson = JSON.parse(event.target.result);
                    setJsonContent(JSON.stringify(parsedJson, null, 2));
                } catch (error) {
                    alert('Invalid JSON file.');
                    setJsonContent('');
                }
            };
            reader.readAsText(file);
        }
    };

    const importSpace = async () => {
        if (!apiKey) {
            alert('Please enter your API key.');
            return;
        }
        if (!userId) {
            alert('Please enter the User ID for the space admin.');
            return;
        }
        if (!jsonContent) {
            alert('Please select a JSON file to import.');
            return;
        }

        setIsImporting(true);
        setImportStatus('Importing...');

        try {
            const fileContent = JSON.parse(jsonContent);
            const response = await fetch(`${API_BASE_URL}/spaces/import/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fileContent)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            
            const newSpace = await response.json();
            
            const addMemberResponse = await fetch(`${API_BASE_URL}/spaces/${newSpace.id}/members/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    member: parseInt(userId, 10),
                    role: 'admin'
                })
            });

            if (!addMemberResponse.ok) {
                const errorData = await addMemberResponse.json();
                throw new Error(`Failed to add admin to space: ${JSON.stringify(errorData)}`);
            }

            setImportStatus(`Successfully imported space: ${newSpace.name} (ID: ${newSpace.id}) and added admin.`);
        } catch (error) {
            let errorMessage = "Failed to import space.";
            if (error instanceof SyntaxError) {
                errorMessage = "Invalid JSON format in the editor.";
            }
            alert(errorMessage);
            setImportStatus(`Error: ${error.message}`);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div>
            <h1>Import Space</h1>
            <div className="card">
                <div className="input-group">
                    <label htmlFor="apiKeyImport">Company REST API Key:</label>
                    <input type="password" id="apiKeyImport" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your API key" className="input-field" />
                </div>
                <div className="input-group">
                    <label htmlFor="userIdImport">Admin User ID:</label>
                    <input type="text" id="userIdImport" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter user ID to make admin" className="input-field" />
                </div>
                <div className="input-group">
                    <label htmlFor="file-upload">Select JSON File:</label>
                    <input type="file" id="file-upload" accept=".json" onChange={handleFileChange} className="input-field" />
                </div>
            </div>

            {jsonContent && (
                <div className="card">
                    <h2>Preview and Modify Template</h2>
                    <textarea
                        className="output-box"
                        style={{ height: '300px', width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
                    />
                    <button onClick={importSpace} disabled={isImporting} className="btn">
                        {isImporting ? 'Importing...' : 'Import Space'}
                    </button>
                </div>
            )}

            {importStatus && (
                <div className="card">
                    <h2>Import Status:</h2>
                    <pre className="output-box">{importStatus}</pre>
                </div>
            )}
        </div>
    );
};

export default Import; 