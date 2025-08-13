import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// Get the root element and ensure it exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Make sure you have a div with id="root" in your HTML.')
}

// Create root and render the app
const root = ReactDOM.createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Hide loading screen when React has mounted
if (typeof window !== 'undefined') {
  // Wait for the next frame to ensure React has rendered
  requestAnimationFrame(() => {
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      loadingScreen.style.opacity = '0'
      loadingScreen.style.transition = 'opacity 0.5s ease-out'
      
      setTimeout(() => {
        loadingScreen.remove()
        document.body.classList.remove('loading')
      }, 500)
    }
  })
}