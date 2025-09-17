import React from 'react';
import IncidentsList from './components/IncidentsList';

export default function App() {
  return (
    <div className="container my-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Incident Reporting — Phase 1</h1>
        <small className="text-muted">Public CRUD (no auth)</small>
      </header>

      <main>
        <IncidentsList />
      </main>

      <footer className="mt-5 text-center text-muted">
        © {new Date().getFullYear()} Incident Management
      </footer>
    </div>
  );
}
