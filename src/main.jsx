import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './theme.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider><App /></ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
