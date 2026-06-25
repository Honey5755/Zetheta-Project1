import Wizard from './components/wizard/Wizard.jsx';

/**
 * Application root — hosts the multi-step loan application wizard.
 */
function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Wizard />
    </div>
  );
}

export default App;
