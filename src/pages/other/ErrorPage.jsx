import {useNavigate} from "react-router-dom";

const ErrorPage = () => {
    const navigate = useNavigate();
    navigate('/main')
};

export default ErrorPage;
