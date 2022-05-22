import styles from './styles/app.module.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './routes/Auth';
import Service from './routes/Service';
import SideNav from './components/SideNav';
import { useState } from 'react';
import { getCookie } from './util/util';
import services from './config/services.json';
import Home from './routes/Home';

function App() {
    const accessToken = getCookie("accessToken")
    const [loggedIn, setLoggedIn] = useState(accessToken ? true : false);
    const loginPath = "/auth";
    const citizenPortal = services.filter(service => service.name == "Bürgerbüro")[0]

    if(!citizenPortal)
        return <div>Unknown error</div>

    const citizenPortalPath = citizenPortal.url
    const defaultDomain = accessToken ? citizenPortalPath : loginPath

    return (
        <div className={styles.wrapper}>
            <Router>
                <SideNav loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
                <div className={ styles.contentWrapper }>
                    <Routes>
                        <Route path="/" element={<Home path={defaultDomain} /> } />
                        <Route path="/auth" element={<Auth setLoggedIn={setLoggedIn} />} />
                        {services.map(service => (
                            <Route key={`service-${service.name}`} path={service.url} element={<Service path={service.link} />} />
                        ))}
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
