import styles from '../styles/routes/service.module.css';

const Service = ({ path }) => {
    return (
        <iframe className={styles.frame} src={path} ></iframe>  
    );
}

export default Service