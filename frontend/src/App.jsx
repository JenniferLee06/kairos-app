// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import CreateEventPage from './pages/CreateEventPage';
import VotePage from './pages/VotePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateEventPage />} />
      <Route path="/event/:uniqueLink" element={<VotePage />} />
    </Routes>
  );
}
export default App;