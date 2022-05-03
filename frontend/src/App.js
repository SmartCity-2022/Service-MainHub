import styles from './styles/app.module.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './routes/Auth';
import Test from './routes/Test';
import SideNav from './components/SideNav';

function App() {
    return (
        <div className={styles.wrapper}>
            <Router>
                <SideNav />
                <div className={ styles.contentWrapper }>
                    <Routes>
                        <Route path="/" element={<Test />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/test" element={<Test />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
