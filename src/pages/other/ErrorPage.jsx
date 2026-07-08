import {useNavigate} from "react-router-dom";


const ErrorPage = () => {
    const navigate = useNavigate();
    navigate('/selectPlatform')
};

export default ErrorPage;
