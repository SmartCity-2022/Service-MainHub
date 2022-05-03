import { Form, Button } from 'react-bootstrap'
import { useState } from 'react'

const Login = () => {

    const [error, setError] = useState(false)
    const [data, setData] = useState({})
    const [user, setUser] = useState({})

    const handleSubmit = async e => {
        e.preventDefault()
        console.log(data)

        if(!data.email || !data.password) {
            setError(true)
            return
        }

        const fetchedUser = await loginUser(data)
        console.log(fetchedUser)
    }

    const loginUser = async data => {
        const fetchedUser = await fetch("http://localhost:4000/api/login", {
            method: 'post',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data),
        })

        return fetchedUser.json()
    }

    return (
        <Form onSubmit={(e) => handleSubmit(e)}>
            {error && <Form.Text className="text-danger mb-4">
                Ungültige Kombination von Benutzername und Passwort!
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