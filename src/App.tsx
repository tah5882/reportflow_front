import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserLogin from './pages/UserLogin';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import './assets/styles.css';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <Routes>
                        <Route path="/" element={<UserLogin />} />
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </header>
            </div>
        </Router>
    );
}

export default App;
