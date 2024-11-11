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
        <div className="App-header blue " id='app-head'>
            <div className='button-rect-50 right-margin red'>search</div>
            <div className='button-rect-50 right-margin red'>basket</div>
            <div className='button-rect-50 right-margin red'>info</div>
        </div>
        <div className="App-body red" id='app-body'>
            <div className='button-rect-body green'>card 1</div>
            <div className='button-rect-body green'>card 2</div>
            <div className='button-rect-body green'>card 3</div>
        </div>
    </div>
  );
}

export default App;
