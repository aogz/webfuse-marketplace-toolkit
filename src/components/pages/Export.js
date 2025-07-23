import React, { useState } from 'react';
import './Page.css';

const Export = ({ domain }) => {
    const [apiKey, setApiKey] = useState('');
    const [spaces, setSpaces] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState('');
    const [manualSpaceId, setManualSpaceId] = useState('');
    const [useManualId, setUseManualId] = useState(false);
    const [exportedData, setExportedData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const API_BASE_URL = `https://${domain}/api`;

    const fetchSpaces = async () => {
        if (!apiKey) {
            alert('Please enter your API key.');
            return;
        }
        setIsLoading(true);
        setExportedData('');
        
        try {
            let allSpaces = [];
            let page = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const response = await fetch(`${API_BASE_URL}/spaces/?page=${page}`, {
                    headers: { 'Authorization': `Token ${apiKey}` }
                });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                allSpaces = [...allSpaces, ...data.results];
                
                // Check if there are more pages
                hasMorePages = data.next !== null;
                page++;
            }

            setSpaces(allSpaces);
            if (allSpaces.length > 0) {
                setSelectedSpace(allSpaces[0].id);
            } else {
                alert('No spaces found for this API key.');
            }
        } catch (error) {
            alert('Failed to fetch spaces. Please check your API key and network connection.');
            setExportedData(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const exportSpace = async () => {
        const spaceId = useManualId ? manualSpaceId : selectedSpace;
        
        if (!spaceId) {
            alert('Please select a space or enter a space ID to export.');
            return;
        }
        setIsExporting(true);
        setExportedData('Exporting...');
        try {
            const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}/export/`, {
                headers: { 'Authorization': `Token ${apiKey}` }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setExportedData(JSON.stringify(data, null, 2));
        } catch (error) {
            alert('Failed to export space.');
            setExportedData(`Error: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const downloadJson = () => {
        if (!exportedData || exportedData.startsWith('Error:')) {
            alert('No data to download.');
            return;
        }
        const spaceId = useManualId ? manualSpaceId : selectedSpace;
        const blob = new Blob([exportedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `space-export-${spaceId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h1>Export Space</h1>
            <div className="card">
                <div className="input-group">
                    <label htmlFor="apiKey">Company REST API Key:</label>
                    <input type="password" id="apiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your API key" className="input-field" />
                </div>
                <button onClick={fetchSpaces} disabled={isLoading} className="btn">
                    {isLoading ? 'Fetching...' : 'Fetch Spaces'}
                </button>
            </div>

            {spaces.length > 0 && (
                <div className="card">
                    <div className="input-group">
                        <label>
                            <input 
                                type="radio" 
                                name="spaceSelection" 
                                checked={!useManualId} 
                                onChange={() => setUseManualId(false)}
                            />
                            Select from list
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="spaceSelection" 
                                checked={useManualId} 
                                onChange={() => setUseManualId(true)}
                            />
                            Enter Space ID manually
                        </label>
                    </div>
                    
                    {!useManualId ? (
                        <div className="input-group">
                            <label htmlFor="spaces">Select a Space:</label>
                            <select id="spaces" value={selectedSpace} onChange={(e) => setSelectedSpace(e.target.value)} className="input-field">
                                {spaces.map(space => (
                                    <option key={space.id} value={space.id}>{space.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="input-group">
                            <label htmlFor="manualSpaceId">Space ID:</label>
                            <input 
                                type="text" 
                                id="manualSpaceId" 
                                value={manualSpaceId} 
                                onChange={(e) => setManualSpaceId(e.target.value)} 
                                placeholder="Enter space ID" 
                                className="input-field" 
                            />
                        </div>
                    )}
                    
                    <button onClick={exportSpace} disabled={isExporting} className="btn">
                        {isExporting ? 'Exporting...' : 'Export Space'}
                    </button>
                </div>
            )}

            {exportedData && (
                <div className="card">
                    <h2>Exported Space Data:</h2>
                    <pre className="output-box">{exportedData}</pre>
                    <button onClick={downloadJson} className="btn">Download as JSON</button>
                </div>
            )}
        </div>
    );
};

export default Export; 