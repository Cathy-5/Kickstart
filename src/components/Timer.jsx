import { useState, useEffect, useRef } from 'react';


export default function Timer({ onFinish, autoStart = false }) {
    const [isRunning, setIsRunning] = useState(autoStart);
    const [elapsedTime, setElapsedTime] = useState(0);
    const elapsedTimeRef = useRef(elapsedTime);

    useEffect(() => {
        if (!isRunning) return;

        const startTime = Date.now() - elapsedTimeRef.current;

        const timeId = setInterval(() => {
            const currentTime = Date.now() - startTime;

            elapsedTimeRef.current = currentTime;
            setElapsedTime(currentTime);
    }, 10);

        return () => clearInterval(timeId)
    },[isRunning]); 


    function formatTime() {

        let minutes = Math.floor(elapsedTime / (1000 * 60) % 60);
        let seconds = Math.floor(elapsedTime / (1000) % 60);
        let milliseconds = Math.floor((elapsedTime % 1000) / 10);

        minutes = String(minutes).padStart(2, "0");
        seconds = String(seconds).padStart(2, "0");
        milliseconds = String(milliseconds).padStart(2, "0");

        return `${minutes}:${seconds}:${milliseconds}`

    }

    function handleFinish() {
        if (elapsedTime === 0) return;

        onFinish(elapsedTime);
        setElapsedTime(0);
        elapsedTimeRef.current = 0;
        setIsRunning(false);
    }

    return (
        <section className="timer">
            <span className="eyebrow">Focus time</span>
            <div className="timer-display">{formatTime()}</div>
            <p className="timer-caption">Stay with the next small step.</p>
            <div className="timer-actions">
            <button className="menu-cursor" onClick={ () => setIsRunning(!isRunning)}>{isRunning ? "Pause" : "Start"}</button>
            <button onClick={ () => {setElapsedTime(0); 
                elapsedTimeRef.current = 0;
                setIsRunning(false);
            }}>Reset</button>
            <button onClick={handleFinish}>Finish session</button>
            </div>
        </section>
    );
}
