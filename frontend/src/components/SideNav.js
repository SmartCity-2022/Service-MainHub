import styles from '../styles/components/sidenav.module.css';
import 'react-pro-sidebar/dist/css/styles.css';
import { Link } from 'react-router-dom';
import services from '../config/services.json';
import { logoutUser } from '../util/requests';
import { getCookie } from '../util/util';

const SideNav = ({ loggedIn, setLoggedIn }) => {

    const logout = () => {
        const refreshToken = getCookie("refreshToken")

        if(refreshToken) {
            logoutUser({token: refreshToken})
        }

        document.cookie = "accessToken=u; domain=.smartcity.w-mi.de; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "refreshToken=u; domain=.smartcity.w-mi.de; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        setLoggedIn(false)
    }

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-light" style={{width: "280px"}}>
            <div href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
                <span className="fs-4">Smart City</span>
            </div>
            <hr></hr>
            <ul className="nav nav-pills flex-column mb-auto">
                {
                    services.map(service => (
                        <li key={service.name} className={`mb-1 link-dark`}>
                            <Link to={`/${service.url}`} className={styles.authElement}>{service.name}</Link>
                        </li>
                    ))
                }
            </ul>
            <hr></hr>
            <ul className="nav nav-pills flex-column">
                <li className={`mb-1 link-dark`}>
                    {
                        loggedIn 
                            ? <span onClick={logout} className={styles.authElement}>Logout</span> 
                            : <Link to="/auth" className={styles.authElement}>Login / Register</Link> 
                    }
                    
                </li>
            </ul>
        </div>
    );
}

export default SideNav;