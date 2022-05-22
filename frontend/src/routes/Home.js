import { Navigate } from "react-router-dom"

const Home = ({ path }) => {
    return (
        <Navigate to={path}></Navigate>
    )
}

export default Home