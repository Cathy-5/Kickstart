import { useState, useEffect, useRef } from 'react';

export default function Timer({ onFinish, durationMinutes = 15, autoStart = false }) {
    const totalTime = durationMinutes * 60 * 1000;
    const [isRunning, setIsRunning] = useState(autoStart);
    const [remainingTime, setRemainingTime] = useState(totalTime);
    const remainingTimeRef = useRef(totalTime);
    const onFinishRef = useRef(onFinish);

    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    useEffect(() => {
        if (!isRunning) return;

        let lastTick = Date.now();

        const timeId = setInterval(() => {
            const now = Date.now();
            const nextRemainingTime = Math.max(0, remainingTimeRef.current - (now - lastTick));
            lastTick = now;

            remainingTimeRef.current = nextRemainingTime;
            setRemainingTime(nextRemainingTime);

            if (nextRemainingTime === 0) {
                setIsRunning(false);
                onFinishRef.current(totalTime);
            }
        }, 100);

        return () => clearInterval(timeId);
    }, [isRunning, totalTime]);

    function formatTime() {
        const totalSeconds = Math.ceil(remainingTime / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    const segmentCount = 15;
    const litSegments = remainingTime === 0
        ? 0
        : Math.ceil((remainingTime / totalTime) * segmentCount);

    function handleFinish() {
        const elapsedTime = totalTime - remainingTimeRef.current;
        if (elapsedTime <= 0) return;

        onFinish(elapsedTime);
        setIsRunning(false);
    }

    return (
        <section className="timer">
            <div className={`timer-frame ${remainingTime <= 60000 ? "low-time" : ""}`}>
                <div className="timer-frame-top">
                    <span className="hourglass-mark" aria-hidden="true" />
                    <span className="eyebrow">Focus time</span>
                    <span className="timer-total">of {durationMinutes}:00</span>
                </div>
                <div className="timer-display" aria-label={`${formatTime()} remaining`}>{formatTime()}</div>
                <div className="timer-segments" aria-label={`${litSegments} of ${segmentCount} time segments remaining`} role="img">
                    {Array.from({ length: segmentCount }, (_, index) => (
                        <span className={`timer-segment ${index < litSegments ? "lit" : ""}`} key={index} />
                    ))}
                </div>
            </div>
            <p className="timer-caption">Stay with the next small step.</p>
            <div className="timer-actions">
            <button className="menu-cursor" onClick={ () => setIsRunning(!isRunning)}>{isRunning ? "Pause" : "Start"}</button>
            <button onClick={ () => {
                setIsRunning(false);
                remainingTimeRef.current = totalTime;
                setRemainingTime(totalTime);
            }}>Reset</button>
            <button onClick={handleFinish}>Finish session</button>
            </div>
        </section>
    );
}
