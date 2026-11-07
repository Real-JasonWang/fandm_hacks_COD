// Sound is completely disabled as requested for quiet, privacy-first in-class usage
class MechanicalAudio {
  playClick(): void {}
  playImpact(): void {}
  playCapture(): void {}
  playBuzz(): void {}
  playRadarPing(): void {}
  playSiren(): void {}
  playHiss(): void {}
}

export const sound = new MechanicalAudio();
