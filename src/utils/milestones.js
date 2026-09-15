const MILESTONE_GOAL_SECONDS = 60 * 60;
const audioCache = new Map();

export function primeMilestoneAudio() {
  ["/audio/times-up.mp3", "/audio/reach-one-hour.mp3"].forEach((audioSrc) => {
    if (audioCache.has(audioSrc)) return;

    const audio = new Audio(audioSrc);
    audio.preload = "auto";
    audioCache.set(audioSrc, audio);
    audio.load();
  });
}

export function getMilestoneAudio(audioSrc) {
  return audioCache.get(audioSrc) || new Audio(audioSrc);
}

export function getMilestone(beforeSeconds, afterSeconds, sessionMinutes) {
  const reachedGoal = Math.floor(afterSeconds / MILESTONE_GOAL_SECONDS) > Math.floor(beforeSeconds / MILESTONE_GOAL_SECONDS);

  if (reachedGoal) {
    return {
      kind: "hour",
      title: "Camp reached!",
      message: "You focused for one hour. Your runner made it home.",
      audioSrc: "/audio/reach-one-hour.mp3",
    };
  }

  return {
    kind: "session",
    title: "Session complete!",
    message: `Good job. You focused for ${sessionMinutes} minutes.`,
    audioSrc: "/audio/times-up.mp3",
  };
}
