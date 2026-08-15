import {Navigate} from "react-router-dom";

// Заглушка для неизвестных адресов (<Route path="*">).
// Раньше здесь navigate() вызывался прямо в теле компонента — навигация во время
// рендера, на что React Router ругается, — и без replace: битый адрес оставался в
// истории, поэтому кнопка «назад» возвращала на него же и всё зацикливалось.
const ErrorPage = () => <Navigate to="/selectPlatform" replace/>;

export default ErrorPage;
