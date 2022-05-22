import { Card, Tabs, Tab } from 'react-bootstrap';
import styles from '../styles/routes/auth.module.css';
import Login from '../components/Login';
import Register from '../components/Register';
import { getCookie } from '../util/util';
import services from '../config/services.json';
import { Navigate } from 'react-router-dom';

const Auth = ({ setLoggedIn }) => {

    const accessToken = getCookie("accessToken")

    if(accessToken) {
        const citizenPortal = services.filter(service => service.name == "Bürgerbüro")[0]
        if(citizenPortal)
            return <Navigate to={"/" + citizenPortal.url}></Navigate>
    }

    return (
        <div className={`${styles.wrapper} d-flex justify-content-center align-items-center`}>
             <Card className="opacity-90">
                <Card.Body>
                    <Tabs defaultActiveKey="login" id="auth-tab" className='mb-3' variant='tabs'>
                        <Tab eventKey="login" title="Login">
                            <Login setLoggedIn={setLoggedIn} />
                        </Tab>
                        <Tab eventKey="registerUser" title="Register" >
                            <Register setLoggedIn={setLoggedIn} />
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </div>
    )
}

export default Auth