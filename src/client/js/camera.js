import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const video = document.getElementById('videoPreview');
const cameraBtn = document.getElementById('shootBtn');

let stream;
let recorder;
let contentFile;

const files = {
  input: 'input.webm',
  output: 'output.mp4',
  thumb: 'thumbnail.jpg',
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement('a');
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  cameraBtn.removeEventListener('click', handleDownload);
  cameraBtn.innerText = '변환중...';
  cameraBtn.disabled = true;

  const ffmpeg = createFFmpeg({ corePath: '/convert/ffmpeg-core.js', log: true });
  await ffmpeg.load();

  ffmpeg.FS('writeFile', files.input, await fetchFile(contentFile));

  await ffmpeg.run('-i', files.input, '-r', '60', files.output);

  await ffmpeg.run('-i', files.input, '-ss', '00:00:01', '-frames:v', '1', files.thumb);

  const mp4File = ffmpeg.FS('readFile', files.output);
  const thumbFile = ffmpeg.FS('readFile', files.thumb);
  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const thumbBlob = new Blob([thumbFile.buffer], { type: 'image/jpg' });
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, 'MyContent.mp4');
  downloadFile(thumbUrl, 'MyThumbnail.jpg');

  ffmpeg.FS('unlink', files.input);
  ffmpeg.FS('unlink', files.output);
  ffmpeg.FS('unlink', files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(contentFile);

  cameraBtn.disabled = false;
  cameraBtn.innerText = '촬영하기';
  cameraBtn.addEventListener('click', startRecording);
};

const startRecording = async () => {
  await init();
  cameraBtn.innerText = '촬영중...';
  cameraBtn.disabled = true;
  cameraBtn.removeEventListener('click', startRecording);
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recorder.ondataavailable = (event) => {
    contentFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = contentFile;
    video.loop = false;
    video.play();
    cameraBtn.innerText = '다운로드';
    cameraBtn.disabled = false;
    cameraBtn.addEventListener('click', handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
};

cameraBtn.addEventListener('click', startRecording);
