export const getCookie = name => {
    return document.cookie.split(';').some(c => {
        return c.trim().startsWith(name + '=');
    });
}