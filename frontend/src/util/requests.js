import config from '../config/config.json';
const domain = config.domain;

export const loginUser = async data => {
    const fetchedUser = await fetch(`${domain}/api/login`, {
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
    const fetchedUser = await fetch(`${domain}/api/register`, {
        method: 'post',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data),
    })

    return fetchedUser.json()
}

export const logoutUser = async data => {
    const fetchedUser = await fetch(`${domain}/api/logout`, {
        method: 'delete',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data),
    })

    return fetchedUser.json()
}