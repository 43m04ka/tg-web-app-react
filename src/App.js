//import logo from './logo.svg';
import './App.css';
import {useEffect} from "react";
const tg = window.Telegram.WebApp;
function App() {

    useEffect(() => {
        tg.ready();
    })

    const onCloce = () => {
        tg.close();
    }

  return (
    <div className="App">
      тебе отправили обнимашку
        <button onClick={onCloce}>отправить обнимашку в ответ</button>
    </div>
  );
}

export default App;
