import { Form, Button } from 'react-bootstrap'
import { useState } from 'react'
import { loginUser } from '../util/requests'
import { ERR_EMAIL_USED, ERR_INVALID_INPUT, ERR_USER_NOT_FOUND } from '../util/constants'

const Register = () => {

    const [error, setError] = useState(false)
    const [data, setData] = useState({})
    const [token, setToken] = useState({})

    const handleSubmit = async e => {
        e.preventDefault()

        if(!data.email || !data.password) {
            setError(ERR_INVALID_INPUT)
            return
        }

        const fetchedUser = await loginUser(data)

        if(!fetchedUser)
            setError(ERR_USER_NOT_FOUND)
        else
            setError(false)
        console.log(fetchedUser)
    }

    

    return (
        <Form onSubmit={(e) => handleSubmit(e)}>
            {error && <Form.Text className="text-danger mb-4">
                {error}
            </Form.Text>}
            <Form.Group className="my-3" controlId="formBasicEmail">
                <Form.Label>E-mail Addresse</Form.Label>
                <Form.Control className="m-0" type="email" placeholder="E-Mail Adresse" onChange={(e) => setData({ ...data, email: e.target.value })}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Passwort</Form.Label>
                <Form.Control className="m-0" type="password" placeholder="Passwort" onChange={(e) => setData({ ...data, password: e.target.value })}/>
            </Form.Group>

            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    )

}

export default Login