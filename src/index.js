import bombGif from './assets/kaboom2.gif';
import bgMusicUrl from './assets/bgmusic.mp3';
import expMusicUrl from './assets/explosion.mp3';
import './main.css';
import { domController, loadImage, loadAudio } from './dom.js';

Promise.all([loadImage(bombGif), loadAudio(bgMusicUrl), loadAudio(expMusicUrl)])
    .then(() => {
        console.log('All assets loaded, starting game!');
        domController.initGame();
    })
    .catch((err) => {
        console.error('Asset failed to load:', err);
        domController.initGame();
    });
