import React from 'react';
import ReactDOM from 'react-dom/client';
// If you have a main CSS file (optional, but common)
// import './index.css';
import App from './App'; // Imports your main App component
//import reportWebVitals from './reportWebVitals'; // Optional performance reporting

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
