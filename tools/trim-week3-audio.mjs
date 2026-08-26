import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const decoderModule = process.argv[2];
const projectRoot = resolve(process.argv[3] || '.');
if (!decoderModule) throw new Error('Usage: node trim-week3-audio.mjs <mpg123-decoder/index.js> <project-root>');

const { MPEGDecoder } = await import(pathToFileURL(decoderModule).href);
const audioDirectory = resolve(projectRoot, 'assets/audio/week-3/literacy');
const jobs = [
  {
    source: 'page-04-elements-words.mp3',
    clips: [
      ['page-04-word-trees.wav', 0.08, 1.13],
      ['page-04-word-flowers.wav', 1.58, 2.73],
      ['page-04-word-vegetables.wav', 3.05, 4.26],
      ['page-04-word-fruits.wav', 4.46, 5.45]
    ]
  },
  {
    source: 'page-04-elements-sentences.mp3',
    clips: [
      ['page-04-sentence-flowers.wav', 0.09, 1.90],
      ['page-04-sentence-trees.wav', 2.53, 4.34],
      ['page-04-sentence-vegetables.wav', 4.74, 6.69],
      ['page-04-sentence-fruits.wav', 6.93, 8.38]
    ]
  },
  {
    source: 'page-05-elements-words.mp3',
    clips: [
      ['page-05-word-trees.wav', 0, 1.07],
      ['page-05-word-cars.wav', 1.33, 2.25],
      ['page-05-word-clean-water.wav', 2.26, 3.40],
      ['page-05-word-planes.wav', 3.57, 4.65],
      ['page-05-word-plants.wav', 4.83, 5.92],
      ['page-05-word-boats.wav', 6.31, 7.27]
    ]
  },
  {
    source: 'page-05-elements-correct-sentences.mp3',
    clips: [
      ['page-05-sentence-trees.wav', 0, 1.64],
      ['page-05-sentence-clean-water.wav', 2.27, 3.98],
      ['page-05-sentence-plants.wav', 4.90, 6.69]
    ]
  },
  {
    source: 'page-06-elements-words.mp3',
    clips: [
      ['page-06-word-flowers.wav', 0.08, 1.10],
      ['page-06-word-bees.wav', 1.46, 2.39],
      ['page-06-word-clean-air.wav', 3.03, 4.13]
    ]
  },
  {
    source: 'page-06-elements-sentences.mp3',
    clips: [
      ['page-06-sentence-flowers.wav', 0.03, 1.88],
      ['page-06-sentence-clean-air.wav', 2.52, 4.40],
      ['page-06-sentence-bees.wav', 5.14, 6.84]
    ]
  }
];

function encodeWav(channels, sampleRate, startTime, endTime) {
  const start = Math.max(0, Math.floor(startTime * sampleRate));
  const end = Math.min(channels[0].length, Math.ceil(endTime * sampleRate));
  const frameCount = Math.max(0, end - start);
  const channelCount = channels.length;
  const dataSize = frameCount * channelCount * 2;
  const output = Buffer.alloc(44 + dataSize);
  output.write('RIFF', 0); output.writeUInt32LE(36 + dataSize, 4); output.write('WAVE', 8);
  output.write('fmt ', 12); output.writeUInt32LE(16, 16); output.writeUInt16LE(1, 20);
  output.writeUInt16LE(channelCount, 22); output.writeUInt32LE(sampleRate, 24);
  output.writeUInt32LE(sampleRate * channelCount * 2, 28); output.writeUInt16LE(channelCount * 2, 32);
  output.writeUInt16LE(16, 34); output.write('data', 36); output.writeUInt32LE(dataSize, 40);
  let offset = 44;
  for (let frame = start; frame < end; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]));
      output.writeInt16LE(sample < 0 ? Math.round(sample * 32768) : Math.round(sample * 32767), offset);
      offset += 2;
    }
  }
  return output;
}

await mkdir(audioDirectory, { recursive: true });
const decoder = new MPEGDecoder();
await decoder.ready;
for (const job of jobs) {
  const sourcePath = resolve(audioDirectory, job.source);
  const result = decoder.decode(new Uint8Array(await readFile(sourcePath)));
  if (result.errors.length) console.warn(`${job.source}: ${result.errors.length} decode warning(s)`);
  for (const [filename, start, end] of job.clips) {
    const destination = resolve(audioDirectory, filename);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, encodeWav(result.channelData, result.sampleRate, start, end));
    console.log(`${filename}: ${(end - start).toFixed(2)}s`);
  }
  await decoder.reset();
}
decoder.free();
