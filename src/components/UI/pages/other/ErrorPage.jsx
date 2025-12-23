import {useNavigate} from "react-router-dom";

const ErrorPage = () => {
    const navigate = useNavigate();
    navigate('/')
};

export default ErrorPage;