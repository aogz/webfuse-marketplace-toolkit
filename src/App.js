import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Marketplace from './components/pages/Marketplace';
import Export from './components/pages/Export';
import Import from './components/pages/Import';
import './App.css';

function App() {
  const [domain, setDomain] = useState('webfu.se');

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
            <label htmlFor="domain" >API Domain:</label>
            <select id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} >
              <option value="webfu.se">webfu.se</option>
              <option value="webfuse.com">webfuse.com</option>
              <option value="sbox.net">sbox.net</option>
            </select>
          </div>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<Marketplace domain={domain} />} />
            <Route path="/export" element={<Export domain={domain} />} />
            <Route path="/import" element={<Import domain={domain} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 