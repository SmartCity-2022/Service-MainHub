export const loginUser = async data => {
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

export const registerUser = async data => {
    const fetchedUser = await fetch("http://localhost:4000/api/register", {
        method: 'post',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data),
    })

    return fetchedUser.json()
}