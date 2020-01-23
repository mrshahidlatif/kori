import React from 'react';
import Header from './components/header';
import QuillTextEditor from './components/quillText';
import VegaLiteVis from './components/vegaLiteVis';
import './App.css';

function App() {
  return (
    <React.Fragment>
      <Header />
      <main className="container">
        <QuillTextEditor />
        <VegaLiteVis />
      </main>
    </React.Fragment>
  );
}

export default App;
