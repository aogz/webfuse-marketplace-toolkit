import React, { useState } from 'react';
import './Page.css';

const Import = ({ domain }) => {
    const [apiKey, setApiKey] = useState('');
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [isFetchingUsers, setIsFetchingUsers] = useState(false);
    const [jsonContent, setJsonContent] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState('');

    const API_BASE_URL = `https://${domain}/api`;

    const fetchUsers = async () => {
        if (!apiKey) {
            alert('Please enter your API key first.');
            return;
        }
        setIsFetchingUsers(true);
        try {
            let allUsers = [];
            let page = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const response = await fetch(`${API_BASE_URL}/company/users/?page=${page}`, {
                    headers: { 'Authorization': `Token ${apiKey}` }
                });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                allUsers = [...allUsers, ...data.results];
                
                hasMorePages = data.next !== null;
                page++;
            }

            setUsers(allUsers);
            if (allUsers.length > 0) {
                setUserId(allUsers[0].id);
            } else {
                alert('No users found for this company.');
            }
        } catch (error) {
            alert('Failed to fetch users.');
            console.error(error);
        } finally {
            setIsFetchingUsers(false);
        }
    };

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
            alert('Please fetch the users and select an admin.');
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
                    <button onClick={fetchUsers} disabled={isFetchingUsers || !apiKey} className="btn">
                        {isFetchingUsers ? 'Fetching Users...' : 'Fetch Company Users'}
                    </button>
                </div>
                
                {users.length > 0 && (
                    <div className="input-group">
                        <label htmlFor="userIdImport">Admin User:</label>
                        <select 
                            id="userIdImport" 
                            value={userId} 
                            onChange={(e) => setUserId(e.target.value)} 
                            className="input-field"
                        >
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
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