//import logo from './logo.svg';
import './App.css';
import {useEffect} from "react";
import {useTelegram} from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import Button from "./components/Button/Button";
function App() {

    const {tg, onToggleButton} = useTelegram()


    useEffect(() => {
        tg.ready();
    })

  return (
    <div className="App">
        <Header></Header>
        <Button onClick={onToggleButton}>Toggle Telegram</Button>
    </div>
  );
}

export default App;
