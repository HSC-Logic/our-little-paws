// Original procedural instrumental loops. No recordings or external samples.
import fs from "node:fs";
const rate = 22050;
const arrangements = [
  {
    id: "morning",
    bpm: 76,
    notes: [60, 64, 67, 69, 67, 64, 62, 64, 65, 69, 72, 69, 67, 64, 62, 60],
    chords: [
      [48, 52, 55],
      [45, 48, 52],
      [41, 45, 48],
      [43, 47, 50],
    ],
  },
  {
    id: "rain",
    bpm: 64,
    notes: [62, 65, 69, 72, 69, 65, 64, 62, 60, 64, 67, 71, 67, 64, 62, 60],
    chords: [
      [50, 53, 57],
      [46, 50, 53],
      [48, 52, 55],
      [45, 48, 52],
    ],
  },
  {
    id: "moon",
    bpm: 58,
    notes: [64, 67, 71, 74, 71, 67, 66, 64, 62, 66, 69, 73, 71, 69, 66, 64],
    chords: [
      [52, 55, 59],
      [48, 52, 55],
      [50, 54, 57],
      [47, 50, 54],
    ],
  },
];
const frequency = (m) => 440 * 2 ** ((m - 69) / 12);
fs.mkdirSync("public/audio", { recursive: true });
for (const song of arrangements) {
  const beat = 60 / song.bpm,
    seconds = 16 * beat + 1,
    samples = new Float64Array(Math.ceil(seconds * rate));
  const note = (pitch, start, length, gain, soft = false) => {
    const hz = frequency(pitch);
    for (
      let i = 0;
      i < length * rate && Math.floor(start * rate) + i < samples.length;
      i++
    ) {
      const t = i / rate,
        attack = Math.min(1, t / (soft ? 0.2 : 0.012)),
        release = Math.min(1, (length - t) / 0.25);
      const envelope = attack * release * Math.exp(-t / (soft ? 3 : 0.65));
      const tone =
        Math.sin(2 * Math.PI * hz * t) +
        0.18 * Math.sin(2 * Math.PI * hz * 2 * t) +
        0.045 * Math.sin(2 * Math.PI * hz * 3 * t);
      samples[Math.floor(start * rate) + i] += tone * envelope * gain;
    }
  };
  song.notes.forEach((pitch, i) => note(pitch, i * beat, beat * 1.7, 0.18));
  song.chords.forEach((chord, i) =>
    chord.forEach((pitch) => note(pitch, i * 4 * beat, 4 * beat, 0.035, true)),
  );
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) =>
    data.writeInt16LE(Math.round(Math.tanh(v) * 0.85 * 32767), i * 2),
  );
  const header = Buffer.alloc(44);
  header.write("RIFF");
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(
    `public/audio/${song.id}.wav`,
    Buffer.concat([header, data]),
  );
  console.log(`${song.id}: ${seconds.toFixed(1)}s original loop`);
}
