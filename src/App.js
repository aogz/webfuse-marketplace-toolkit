import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Marketplace from './components/pages/Marketplace';
import Export from './components/pages/Export';
import Import from './components/pages/Import';
import './App.css';

function App() {
  const [domain, setDomain] = useState('webfu.se');
  const [customDomain, setCustomDomain] = useState('');
  const [useCustomDomain, setUseCustomDomain] = useState(false);

  const effectiveDomain = useCustomDomain ? customDomain : domain;

  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-header">
            <h2 >Marketplace</h2>
          </div>
          <ul>
            <li >
              <NavLink to="/" >Marketplace</NavLink>
            </li>
            <li >
              <NavLink to="/export" >Export</NavLink>
            </li>
            <li >
              <NavLink to="/import" >Import</NavLink>
            </li>
          </ul>
          <div className="domain-selector">
            <label className="block mb-2 text-sm font-medium">API Domain:</label>
            <div className="mb-2">
                <label className="mr-4">
                    <input 
                        type="radio" 
                        name="domainSelection" 
                        checked={!useCustomDomain} 
                        onChange={() => setUseCustomDomain(false)}
                        className="mr-1"
                    />
                    Select from list
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="domainSelection" 
                        checked={useCustomDomain} 
                        onChange={() => setUseCustomDomain(true)}
                        className="mr-1"
                    />
                    Custom
                </label>
            </div>
            {useCustomDomain ? (
                <input 
                    type="text" 
                    value={customDomain} 
                    onChange={(e) => setCustomDomain(e.target.value)} 
                    placeholder="e.g., my-proxy.com"
                    className="w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white"
                />
            ) : (
                <select id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} >
                    <option value="webfu.se">webfu.se</option>
                    <option value="webfuse.com">webfuse.com</option>
                    <option value="sbox.net">sbox.net</option>
                </select>
            )}
          </div>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<Marketplace domain={effectiveDomain} />} />
            <Route path="/export" element={<Export domain={effectiveDomain} />} />
            <Route path="/import" element={<Import domain={effectiveDomain} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 