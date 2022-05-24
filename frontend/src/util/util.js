export const getCookie = name => {
    const cookie = document.cookie.split(";").filter(e => e.trim().startsWith(name + '='))[0]
    return cookie ? cookie.split("=")[1] : false
}