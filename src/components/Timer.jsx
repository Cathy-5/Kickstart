import { useState, useEffect, useRef } from 'react';


export default function Timer() {
    const [isRunning, setIsRunning] = useState(false);
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

    return (
        <section>
            <div>{formatTime()}</div>
            <button onClick={ () => setIsRunning(true)}>Start</button>
            <button onClick={ () => setIsRunning(false)}>Pause</button>
            <button onClick={ () => {setElapsedTime(0); 
                elapsedTimeRef.current = 0;
                setIsRunning(false);
            }}>Reset</button>
        </section>
    );
}

