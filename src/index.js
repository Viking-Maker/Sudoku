import React from 'react';
import ReactDOM from 'react-dom/client';
// If you don't have a separate index.css, remove this line
// import './index.css'; // You might need a basic CSS reset or global styles here
import App from './App';
// import reportWebVitals from './reportWebVitals'; // Optional

// Ensure the root element exists in your public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(); // Optional
