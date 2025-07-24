import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Page.css';
import './Marketplace.css';

const Marketplace = ({ domain }) => {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [installing, setInstalling] = useState(null);

    const GITHUB_API_URL = 'https://api.github.com/repos/JSPOON3R/webfuse-spaces/contents/';
    
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch(GITHUB_API_URL);
                if (!response.ok) throw new Error('Failed to fetch repository contents.');
                const contents = await response.json();
                
                const templateFolders = contents.filter(item => item.type === 'dir');
                const templatesData = await Promise.all(templateFolders.map(async folder => {
                    const readmeResponse = await fetch(`${GITHUB_API_URL}${folder.path}`);
                    const folderContents = await readmeResponse.json();
                    
                    const readmeFile = folderContents.find(f => f.name.toLowerCase() === 'readme.md');
                    const templateFile = folderContents.find(f => f.name.toLowerCase() === 'template.json');

                    if (!readmeFile || !templateFile) return null;

                    const readmeContentResponse = await fetch(readmeFile.download_url);
                    const readme = await readmeContentResponse.text();

                    return {
                        id: folder.path,
                        name: folder.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        description: readme,
                        templateUrl: templateFile.download_url,
                    };
                }));

                setTemplates(templatesData.filter(Boolean));
            } catch (error) {
                console.error('Error fetching templates:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    const handleDownload = async (template) => {
        try {
            const response = await fetch(template.templateUrl);
            const data = await response.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to download template.');
        }
    };

    const handleInstall = async (template) => {
        const apiKey = prompt('Please enter your Company REST API Key to install this template:');
        if (!apiKey) {
            return;
        }

        const userId = prompt('Please enter the User ID for the space admin:');
        if (!userId) {
            return;
        }
        
        setInstalling(template.id);
        try {
            const templateResponse = await fetch(template.templateUrl);
            const templateJson = await templateResponse.json();
            
            const importResponse = await fetch(`https://${domain}/api/spaces/import/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateJson)
            });

            if (!importResponse.ok) {
                const errorData = await importResponse.json();
                throw new Error(`HTTP error! status: ${importResponse.status} - ${JSON.stringify(errorData)}`);
            }

            const newSpace = await importResponse.json();

            const addMemberResponse = await fetch(`https://${domain}/api/spaces/${newSpace.id}/members/`, {
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

            alert(`Successfully installed template: ${newSpace.name} and added admin.`);

        } catch (error) {
            alert(`Failed to install template: ${error.message}`);
        } finally {
            setInstalling(null);
        }
    };

    return (
        <div>
            <h1>Marketplace</h1>
            <p>A collection of webfuse space templates from <a href="https://github.com/aogz/space-templates" target="_blank" rel="noopener noreferrer">aogz/space-templates</a>.</p>

            {isLoading ? <p>Loading templates...</p> : (
                <div className="templates-grid">
                    {templates.map(template => (
                        <div key={template.id} className="template-card">
                            <h3>{template.name}</h3>
                            <div className="template-description">
                                <ReactMarkdown>{template.description}</ReactMarkdown>
                            </div>
                            <div className="template-actions">
                                <button 
                                    onClick={() => handleDownload(template)}
                                    className="btn btn-secondary"
                                >
                                    Download
                                </button>
                                <button 
                                    onClick={() => handleInstall(template)}
                                    className="btn"
                                    disabled={installing === template.id}
                                >
                                    {installing === template.id ? 'Installing...' : 'Install'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace; 
