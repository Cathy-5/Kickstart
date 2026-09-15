import { useEffect, useRef, useState } from "react";
import { getMilestoneAudio } from "../utils/milestones.js";

export default function MilestoneDialog({ milestone, onDismiss }) {
  const audioRef = useRef(null);
  const [needsPlayButton, setNeedsPlayButton] = useState(false);

  useEffect(() => {
    const audio = getMilestoneAudio(milestone.audioSrc);
    audio.preload = "auto";
    audio.volume = 0.7;
    audio.muted = false;
    audioRef.current = audio;

    audio.play().catch(() => setNeedsPlayButton(true));

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, [milestone]);

  function playSound() {
    audioRef.current?.play().then(() => setNeedsPlayButton(false)).catch(() => {});
  }

  return (
    <div className="milestone-backdrop">
      <section className="milestone-dialog" role="dialog" aria-modal="true" aria-labelledby="milestone-title">
        <span className="milestone-spark" aria-hidden="true">*</span>
        <h2 id="milestone-title">{milestone.title}</h2>
        <p>{milestone.message}</p>
        <div className="milestone-actions">
          {needsPlayButton && <button className="sound-button" type="button" onClick={playSound}>Play sound</button>}
          <button type="button" autoFocus onClick={onDismiss}>OK, keep going</button>
        </div>
      </section>
    </div>
  );
}
