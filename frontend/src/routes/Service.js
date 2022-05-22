import { Navigate } from 'react-router-dom';
import styles from '../styles/routes/service.module.css';
import { getCookie } from '../util/util';

const Service = ({ path }) => {
    
    const accessToken = getCookie("accessToken")

    console.log(path)

    return (
        accessToken 
            ? <iframe className={styles.frame} src={path} ></iframe>  
            : <Navigate to="/auth"></Navigate>
    );
}

export default Service