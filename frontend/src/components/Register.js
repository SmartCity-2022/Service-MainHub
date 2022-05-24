import { Form, Button } from 'react-bootstrap'
import { useState, Navigate } from 'react'
import { registerUser } from '../util/requests'
import { ERR_INVALID_INPUT, ERR_USER_NOT_FOUND, ERR_WRONG_PASS_REPEAT } from '../util/constants'
import styles from '../styles/components/auth.module.css';

const Register = ({ setLoggedIn }) => {

    const [error, setError] = useState(false)
    const [data, setData] = useState({})
        
    const handleSubmit = async e => {
        e.preventDefault()

        if(!data.email || !data.password || !data.password2) {
            setError(ERR_INVALID_INPUT)
            return
        }

        if(data.password != data.password2) {
            setError(ERR_WRONG_PASS_REPEAT)
            return
        }

        const res = await registerUser(data)

        if(res.errMsg)
            setError(res.errMsg)
        else {
            setError(false)
            setLoggedIn(true)
            document.cookie = `accessToken=${res.accessToken};domain=.smartcity.w-mi.de`
            document.cookie = `refreshToken=${res.refreshToken};domain=.smartcity.w-mi.de`
        }
    }

    

    return (
        <Form onSubmit={(e) => handleSubmit(e)}>
            {error && <Form.Text className="text-danger mb-4">
                {error}
            </Form.Text>}
            <Form.Group className="my-3" controlId="formBasicEmail">
                <Form.Label>E-mail Addresse</Form.Label>
                <Form.Control className={`${styles.input} m-0`} type="email" placeholder="E-Mail Adresse" onChange={(e) => setData({ ...data, email: e.target.value })}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Passwort</Form.Label>
                <Form.Control className={`${styles.input} m-0`} type="password" placeholder="Passwort" onChange={(e) => setData({ ...data, password: e.target.value })}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Passwort wiederholen</Form.Label>
                <Form.Control className={`${styles.input} m-0`} type="password" placeholder="Passwort erneut eingeben" onChange={(e) => setData({ ...data, password2: e.target.value })}/>
            </Form.Group>

            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    )

}

export default Register