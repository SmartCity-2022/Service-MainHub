import styles from '../styles/components/sidenav.module.css';
import 'react-pro-sidebar/dist/css/styles.css';
import { RiBankLine } from 'react-icons/ri';
import Auth from '../routes/Auth';
import { Link } from 'react-router-dom';

const SideNav = () => {
    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-light" style={{width: "280px"}}>
            <div href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
                <span className="fs-4">Smart City</span>
            </div>
            <hr></hr>
            <ul className="nav nav-pills flex-column mb-auto">
                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Bank</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Bauamt</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Bildungsportal</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Bürgerbüro</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Gesundheitsportal</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Immobilienportal</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Jobportal</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Kulturportal</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Mobilitätshub</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Polizei</Link>
                </li>

                <li className={`mb-1 link-dark`}>
                    <Link to="/" className={styles.authElement}>Straßenverkehrsamt</Link>
                </li>
            </ul>

            <hr></hr>
            {/* <div className="dropdown">
                <a href="#" className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2">
                    <strong>mdo</strong>
                </a>
                <ul className="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
                    <li><a className="dropdown-item" href="#">New project...</a></li>
                    <li><a className="dropdown-item" href="#">Settings</a></li>
                    <li><a className="dropdown-item" href="#">Profile</a></li>
                    <li><hr className="dropdown-divider"></hr></li>
                    <li><a className="dropdown-item" href="#">Sign out</a></li>
                </ul>
            </div> */}
            <ul className="nav nav-pills flex-column">
                <li className={`mb-1 link-dark`}>
                    <Link to="/auth" className={styles.authElement}>Login / Register</Link>
                </li>
            </ul>
        </div>
    );
}

export default SideNav;