const express = require('express');
const { exec } = require('child_process');
const TikTokAPI = require('tiktok-api');

const app = express();
const port = 3000;

// app.get('/', (req, res) => res.send('Hello World!'));

const api = new TikTokAPI({
  session: 'YOUR_SESSION_ID',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
});

const getLatestFootballVideo = async () => {
  const latestVideoUrl = 'https://www.youtube.com/watch?v=VIDEO_ID';
  return latestVideoUrl;
};

const extractBestMoment = async (videoUrl) => {
  return new Promise((resolve, reject) => {
    const video = youtubedl(videoUrl, ['--format=best']);
    video.on('info', (info) => {
      const videoPath = info._filename;
      const outputPath = '/path/to/best/moment.mp4';

      // Exemple de code pour extraire le meilleur moment de la vidéo
      // Utilisation de FFmpeg pour découper la vidéo
      const command = `ffmpeg -i ${videoPath} -vf "select='gt(scene,0.4)',showinfo" -c:v libx264 -crf 18 -c:a aac -strict experimental -t 20 ${outputPath}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(outputPath);
        }
      });
    });
    video.on('error', (err) => {
      reject(err);
    });
  });
};

const create20SecondClip = async (videoPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = '/path/to/20/second/clip.mp4';
    const command = `ffmpeg -ss 0 -i ${videoPath} -t 20 -c copy ${outputPath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(outputPath);
      }
    });
  });
};

const publishToTikTok = async (videoPath) => {
  try {
    const uploadResponse = await api.uploadVideo(videoPath);
    const videoId = uploadResponse.video.id;

    const options = {
      description: 'Regardez ce superbe moment de football !',
    };

    const publishResponse = await api.publishVideo(videoId, options);
    console.log('Vidéo publiée sur TikTok avec succès!', publishResponse);
  } catch (error) {
    console.error('Erreur lors de la publication sur TikTok:', error);
  }
};

const main = async () => {
  try {
    const latestVideoUrl = await getLatestFootballVideo();
    const bestMomentPath = await extractBestMoment(latestVideoUrl);
    const clipPath = await create20SecondClip(bestMomentPath);
    await publishToTikTok(clipPath);
  } catch (error) {
    console.error('Une erreur est survenue:', error);
  }
};

main();
      
app.listen(port, () => console.log(`Express app running on port ${port}!`));