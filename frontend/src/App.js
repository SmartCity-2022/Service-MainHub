import styles from './styles/app.module.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './routes/Auth';
import Service from './routes/Service';
import SideNav from './components/SideNav';
import { useState } from 'react';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);

    return (
        <div className={styles.wrapper}>
            <Router>
                <SideNav loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
                <div className={ styles.contentWrapper }>
                    <Routes>
                        <Route path="/" element={<Service />} />
                        <Route path="/auth" element={<Auth setLoggedIn={setLoggedIn} />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
