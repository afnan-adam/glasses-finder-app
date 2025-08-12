import GlassesFinder from './components/GlassesFinder'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { ToastProvider } from './components/ui/Toast'

function App() {
  return (
    <ErrorBoundary title="Application Error">
      <ToastProvider>
        <GlassesFinder />
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
