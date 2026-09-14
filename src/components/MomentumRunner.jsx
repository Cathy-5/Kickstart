import { formatFocusTime, getJourney } from "../utils/focusProgress.js";

const poses = {
  stride: {
    trousers: "M13 27h10v5h-5v3h-5v-3H9v-3h4z M20 30h5v4h3v4h-5v-4h-3z",
    shoes: "M6 33h8v4H4v-2h2z M23 36h6v2h3v2h-9z",
    soles: "M4 36h10v2H4z M23 39h9v1h-9z",
    arms: "M11 20H8v5h6v-3h-3z M24 19h3v-3h3v6h-6z",
  },
  strideAlt: {
    trousers: "M13 27h10v5h-6v7h-4z M20 30h5v2h4v4h-5v-2h-4z",
    shoes: "M12 36h6v2h4v2H11v-2h1z M25 34h5v2h2v3h-7z",
    soles: "M11 39h11v1H11z M25 38h7v1h-7z",
    arms: "M11 19H8v-3H5v6h6z M24 20h3v6h-6v-3h3z",
  },
  rest: {
    trousers: "M13 27h11v6h-2v6h-5v-8h-1v8h-5v-7h2z",
    shoes: "M11 36h5v2h3v2H9v-2h2z M18 36h5v2h4v2h-9z",
    soles: "M9 39h10v1H9z M18 39h9v1h-9z",
    arms: "M11 20H8v7h4v-3h-1z M24 20h3v7h-4v-3h1z",
  },
  wave: {
    trousers: "M13 27h11v6h-2v6h-5v-8h-1v8h-5v-7h2z",
    shoes: "M11 36h5v2h3v2H9v-2h2z M18 36h5v2h4v2h-9z",
    soles: "M9 39h10v1H9z M18 39h9v1h-9z",
    arms: "M11 20H8v7h4v-3h-1z",
  },
};

function RunnerSprite({ pose, className = "" }) {
  const frame = poses[pose];
  return (
    <svg className={`runner-sprite ${className}`} viewBox="0 0 36 40" shapeRendering="crispEdges">
      <path fill="#354442" d={frame.trousers} />
      <path fill="#ba5940" d={frame.shoes} />
      <path fill="#fff5dc" d={frame.soles} />
      <path fill="#edba85" d={frame.arms} />
      {pose === "wave" && <path className="runner-wave-arm" fill="#edba85" d="M24 20h3v-5h3V8h-3v6h-3z" />}
      <path fill="#bf895f" d="M16 13h5v6h-5z" />
      <path fill="#f7edcf" d="M12 17h11v2h3v5h-3v5H12v-5H9v-5h3z" />
      <path fill="#e4b547" d="M15 19h6v8h-6z" />
      <path fill="#354442" d="M17 21h2v4h-2z" />
      <g className="runner-head">
        <path fill="#edba85" d="M13 6h12v5h2v2h-3v3h-9v-3h-3V9h1z" />
        <path fill="#30342c" d="M12 2h3V0h3v2h6v2h2v3H15v4h-3V8h-2V4h2z" />
        <path fill="#bb4f3a" d="M11 6h15v3H11z M7 7h4v3H6V8H3V6h4z M8 9h3v3H8v2H5v-3h3z" />
        <path fill="#e58359" d="M12 6h12v1H12z" />
        <path fill="#30342c" d="M23 10h2v2h-2z M21 14h3v1h-3z" />
        <path fill="#d89a6a" d="M12 10h3v3h-3z" />
      </g>
    </svg>
  );
}

export default function MomentumRunner({ totalSeconds = 0, isRunning = false, celebrate = false, className = "" }) {
  const journey = getJourney(totalSeconds);
  const state = celebrate ? "celebrating" : isRunning ? "running" : "resting";
  const description = `${formatFocusTime(totalSeconds)} focused in total. ${journey.completed} trails completed. ${journey.remainingMinutes ? `${journey.remainingMinutes} more focused minutes to the next camp.` : "Camp reached!"} Every session counts; one trail is 60 focused minutes.`;

  return (
    <div className={`runner-trail is-${state} ${className}`}
      tabIndex={0} role="img" aria-label={description} data-tooltip={description}>
      <div className="trail-caption" aria-hidden="true">
        <span>TRAIL {String(journey.stage).padStart(2, "0")}</span>
        <span>{formatFocusTime(totalSeconds)} focused</span>
      </div>
      <div className="trail-scene" aria-hidden="true">
        <div className="trail-hills" />
        <div className="trail-ground" />
        <div className="trail-route">
          {[0.25, 0.5, 0.75].map((point) => (
            <span className={`trail-marker ${journey.progress >= point ? "passed" : ""}`}
              style={{ left: `${point * 100}%` }} key={point} />
          ))}
          <span className="trail-earned" style={{ width: `${journey.progress * 100}%` }} />
          <div className="runner-character" style={{ left: `${journey.progress * 100}%` }}>
            <span className="runner-shadow" />
            {isRunning && !celebrate ? (
              <>
                <RunnerSprite pose="stride" className="runner-frame-a" />
                <RunnerSprite pose="strideAlt" className="runner-frame-b" />
              </>
            ) : <RunnerSprite pose={celebrate ? "wave" : "rest"} />}
            {celebrate && <span className="runner-spark">+</span>}
          </div>
          <svg className="trail-camp" viewBox="0 0 56 45" shapeRendering="crispEdges">
            <path fill="#53694a" d="M8 3h2v38H8z" />
            <path fill="#c16845" d="M10 3h21v11H10z" />
            <path fill="#f2df9e" d="M16 5h4v3h-4z M20 8h4v3h-4z" />
            <path fill="#91a075" d="M35 22h3v3h3v4h3v4h3v4h3v4H20v-4h3v-4h3v-4h3v-4h3z" />
            <path fill="#405740" d="M34 30h3v4h3v7H29v-7h3v-4z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
