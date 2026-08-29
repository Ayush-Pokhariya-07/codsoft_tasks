/**
 * VibeFlow Music Player — script.js
 * Full HTML5 Audio playback logic with all interactive features.
 */

console.log('Music Player initialized');

/* ============================================================
   1. PLAYLIST DATA
   ============================================================ */

/**
 * Each song object holds display metadata plus a placeholder src.
 * Replace `src` values with real audio file paths (mp3 / ogg etc.)
 * when actual audio files are available.
 *
 * `duration` is the display string shown in the queue and as the
 * total-duration label; `durationSec` is the numeric fallback used
 * when the audio element cannot read metadata (placeholder src).
 * `tags` are the genre badges rendered under the track title.
 * `artClass` maps to the CSS class (.q-art-N) that sets the thumbnail gradient.
 */
const playlist = [
  {
    id: 0,
    title: 'Punjabi Hip-Hop Anthem',
    artist: 'DJ Karma feat. MC Desi',
    src: 'audio/punjabi_hiphop_anthem.mp3',
    duration: '3:45',
    durationSec: 225,
    tags: ['Hip-Hop', 'Punjabi'],
    artClass: 'q-art-1',
  },
  {
    id: 1,
    title: 'Kumaoni Folk Fusion Mix',
    artist: 'Pahadi Beats Collective',
    src: 'audio/kumaoni_folk_fusion.mp3',
    duration: '4:12',
    durationSec: 252,
    tags: ['Folk', 'Fusion'],
    artClass: 'q-art-2',
  },
  {
    id: 2,
    title: 'Nepali Acoustic Pop Track',
    artist: 'Himalayan Strings',
    src: 'audio/nepali_acoustic_pop.mp3',
    duration: '3:58',
    durationSec: 238,
    tags: ['Acoustic', 'Pop'],
    artClass: 'q-art-3',
  },
  {
    id: 3,
    title: 'Desi Electronic Groove',
    artist: 'Bombay Bass Lab',
    src: 'audio/desi_electronic_groove.mp3',
    duration: '5:20',
    durationSec: 320,
    tags: ['Electronic', 'Desi'],
    artClass: 'q-art-4',
  },
  {
    id: 4,
    title: 'Rajasthani Desert Blues',
    artist: 'Thar Ensemble',
    src: 'audio/rajasthani_desert_blues.mp3',
    duration: '4:33',
    durationSec: 273,
    tags: ['Blues', 'Rajasthani'],
    artClass: 'q-art-5',
  },
  {
    id: 5,
    title: 'Tamil Indie Dream Pop',
    artist: 'Marina Shore',
    src: 'audio/tamil_indie_dream_pop.mp3',
    duration: '3:22',
    durationSec: 202,
    tags: ['Indie', 'Tamil'],
    artClass: 'q-art-6',
  },
  {
    id: 6,
    title: 'Bollywood Jazz Fusion',
    artist: 'Andheri Sessions',
    src: 'audio/bollywood_jazz_fusion.mp3',
    duration: '4:55',
    durationSec: 295,
    tags: ['Jazz', 'Bollywood'],
    artClass: 'q-art-7',
  },
  {
    id: 7,
    title: 'Bengali Baul Electronic',
    artist: 'Soil & Circuit',
    src: 'audio/bengali_baul_electronic.mp3',
    duration: '3:41',
    durationSec: 221,
    tags: ['Baul', 'Electronic'],
    artClass: 'q-art-8',
  },
];

/* ============================================================
   2. STATE
   ============================================================ */

const audio        = new Audio();          // Central HTML5 Audio instance
let currentIndex   = 0;                    // Index into `playlist` array
let isPlaying      = false;                // Play / Pause toggle state
let isShuffled     = false;               // Shuffle mode toggle
let repeatMode     = 'none';              // 'none' | 'one' | 'all'
let isMuted        = false;               // Mute toggle
let lastVolume     = 0.75;                // Volume before mute (restore on unmute)
let isFavorited    = false;               // Heart / favourite toggle

// Shuffle history: tracks which indices have been played in shuffle mode
// so we avoid immediate repeats when the full cycle hasn't been played yet.
let shuffleHistory = [];

/* ============================================================
   3. DOM REFERENCES
   ============================================================ */

const albumArtEl      = document.getElementById('albumArt');
const musicNoteEl     = albumArtEl.querySelector('.music-note-art');
const trackTitleEl    = document.getElementById('trackTitle');
const trackArtistEl   = document.getElementById('trackArtist');
const trackTagsEl     = trackTitleEl.closest('.track-info').querySelector('.track-tags');

const progressBarEl   = document.getElementById('progressBar');
const progressFillEl  = document.getElementById('progressFill');
const currentTimeEl   = document.getElementById('currentTime');
const totalDurEl      = document.getElementById('totalDuration');

const playPauseBtn    = document.getElementById('playPauseBtn');
const prevBtn         = document.getElementById('prevBtn');
const nextBtn         = document.getElementById('nextBtn');
const shuffleBtn      = document.getElementById('shuffleBtn');
const repeatBtn       = document.getElementById('repeatBtn');

const volumeBarEl     = document.getElementById('volumeBar');
const volumeFillEl    = document.getElementById('volumeFill');
const volumeLabelEl   = document.getElementById('volumeLabel');
const muteBtn         = document.getElementById('muteBtn');
const volUpIcon       = muteBtn.querySelector('.icon-vol-up');
const volMuteIcon     = muteBtn.querySelector('.icon-vol-mute');

const favoriteBtn     = document.getElementById('favoriteBtn');
const queueToggleBtn  = document.getElementById('queueToggleBtn');
const queuePanel      = document.getElementById('queuePanel');
const queueItems      = document.querySelectorAll('.queue-item');

const iconPlay        = playPauseBtn.querySelector('.icon-play');
const iconPause       = playPauseBtn.querySelector('.icon-pause');

/* ============================================================
   4. UTILITY HELPERS
   ============================================================ */

/**
 * Converts a number of seconds into "M:SS" display string.
 * @param {number} sec - Seconds (may be NaN / Infinity from audio API)
 * @returns {string}
 */
function formatTime(sec) {
  if (!isFinite(sec) || isNaN(sec) || sec < 0) return '0:00';
  const m  = Math.floor(sec / 60);
  const s  = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Clamps a value between min and max.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns a random integer in [0, length) that isn't the current index,
 * respecting shuffle history to reduce repeats.
 */
function getShuffleIndex() {
  if (playlist.length === 1) return 0;

  // If we've played everything, reset history
  if (shuffleHistory.length >= playlist.length) {
    shuffleHistory = [currentIndex];
  }

  let idx;
  do {
    idx = Math.floor(Math.random() * playlist.length);
  } while (shuffleHistory.includes(idx));

  return idx;
}

/* ============================================================
   5. UI UPDATE FUNCTIONS
   ============================================================ */

/**
 * Updates the main player UI to reflect the song at `index`.
 * Does NOT start / stop playback — that's the caller's job.
 */
function renderTrack(index) {
  const song = playlist[index];

  // Track title & artist
  trackTitleEl.textContent  = song.title;
  trackArtistEl.textContent = song.artist;

  // Genre tags
  trackTagsEl.innerHTML = song.tags
    .map(t => `<span class="tag">${t}</span>`)
    .join('');

  // Album art gradient — update the art's color class
  // Remove all q-art-N classes then add the correct one
  albumArtEl.className = albumArtEl.className
    .replace(/\bq-art-\d+\b/g, '')
    .trim();
  // Swap the album art background to match the queue thumbnail gradient
  albumArtEl.setAttribute('aria-label', `Album artwork – ${song.title}`);
  // Apply the matching gradient via inline style so the vinyl looks distinct per track
  const gradients = {
    'q-art-1': 'linear-gradient(135deg, hsl(262,70%,28%), hsl(328,65%,28%), hsl(195,70%,28%))',
    'q-art-2': 'linear-gradient(135deg, hsl(195,70%,24%), hsl(262,70%,28%))',
    'q-art-3': 'linear-gradient(135deg, hsl(140,55%,22%), hsl(195,70%,28%))',
    'q-art-4': 'linear-gradient(135deg, hsl(328,65%,28%), hsl(358,70%,35%))',
    'q-art-5': 'linear-gradient(135deg, hsl(35,80%,32%), hsl(20,75%,30%))',
    'q-art-6': 'linear-gradient(135deg, hsl(290,65%,30%), hsl(328,70%,32%))',
    'q-art-7': 'linear-gradient(135deg, hsl(50,75%,28%), hsl(35,80%,30%))',
    'q-art-8': 'linear-gradient(135deg, hsl(180,60%,22%), hsl(140,55%,26%))',
  };
  albumArtEl.style.background = gradients[song.artClass] || gradients['q-art-1'];

  // Progress — reset to 0
  progressBarEl.value       = 0;
  progressBarEl.max         = song.durationSec;
  progressBarEl.setAttribute('aria-valuemax', song.durationSec);
  progressBarEl.setAttribute('aria-valuenow', 0);
  progressFillEl.style.width = '0%';
  currentTimeEl.textContent  = '0:00';
  totalDurEl.textContent     = song.duration;

  // Favorite state — reset per track
  isFavorited = false;
  favoriteBtn.classList.remove('is-active');
  favoriteBtn.setAttribute('aria-pressed', 'false');
  favoriteBtn.setAttribute('aria-label', 'Add to favorites');

  // Queue highlight
  renderQueueActive(index);

  // Update page title
  document.title = `${song.title} — VibeFlow`;
}

/**
 * Toggles the Play/Pause button icon and ARIA attributes.
 */
function renderPlayState(playing) {
  if (playing) {
    iconPlay.style.display  = 'none';
    iconPause.style.display = 'block';
    playPauseBtn.setAttribute('aria-label', 'Pause');
    playPauseBtn.setAttribute('aria-pressed', 'true');
    // Spin the vinyl
    albumArtEl.classList.add('is-playing');
    musicNoteEl.classList.add('is-playing');
  } else {
    iconPlay.style.display  = 'block';
    iconPause.style.display = 'none';
    playPauseBtn.setAttribute('aria-label', 'Play');
    playPauseBtn.setAttribute('aria-pressed', 'false');
    albumArtEl.classList.remove('is-playing');
    musicNoteEl.classList.remove('is-playing');
  }
}

/**
 * Highlights the active queue row and shows the animated bars on it.
 * All other rows revert to their number badge.
 */
function renderQueueActive(index) {
  queueItems.forEach((item, i) => {
    const artEl  = item.querySelector('.queue-art');
    const isActive = (i === index);

    item.classList.toggle('queue-item--active', isActive);
    item.setAttribute('aria-current', isActive ? 'true' : 'false');

    if (isActive) {
      // Replace number badge with playing-bars indicator
      artEl.innerHTML = `
        <span class="q-playing-indicator" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>`;
    } else {
      // Restore number badge
      artEl.innerHTML = `<span class="q-num">${i + 1}</span>`;
    }
  });
}

/**
 * Syncs the progress bar and current-time label to audio.currentTime.
 * Called inside the `timeupdate` event listener.
 */
function renderProgress() {
  const song     = playlist[currentIndex];
  const current  = audio.currentTime;
  // Use real duration if loaded, otherwise fall back to our stored value
  const total    = isFinite(audio.duration) ? audio.duration : song.durationSec;
  const pct      = total > 0 ? (current / total) * 100 : 0;

  progressBarEl.value = current;
  progressBarEl.max   = total;
  progressBarEl.setAttribute('aria-valuenow', Math.floor(current));
  progressFillEl.style.width = `${clamp(pct, 0, 100)}%`;
  currentTimeEl.textContent  = formatTime(current);
}

/**
 * Updates the volume slider fill track and percentage label.
 */
function renderVolume(vol) {
  const pct = Math.round(vol * 100);
  volumeFillEl.style.width  = `${pct}%`;
  volumeLabelEl.textContent = `${pct}%`;
  volumeBarEl.value         = pct;
}

/**
 * Syncs mute icon state.
 */
function renderMuteIcon(muted) {
  volUpIcon.style.display   = muted ? 'none'  : 'block';
  volMuteIcon.style.display = muted ? 'block' : 'none';
  muteBtn.classList.toggle('is-muted', muted);
  muteBtn.setAttribute('aria-pressed', String(muted));
  muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
}

/**
 * Visually reflects the current repeatMode on the repeat button.
 * Cycles: 'none' → 'all' → 'one' → 'none'
 */
function renderRepeatBtn() {
  const isActive = repeatMode !== 'none';
  repeatBtn.classList.toggle('is-active', isActive);
  repeatBtn.setAttribute('aria-pressed', String(isActive));

  // Show "1" overlay badge when repeat-one is active
  let badge = repeatBtn.querySelector('.repeat-one-badge');
  if (repeatMode === 'one') {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'repeat-one-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = '1';
      badge.style.cssText = `
        position:absolute; top:2px; right:2px;
        font-size:0.55rem; font-weight:700; line-height:1;
        color:var(--clr-accent-1);`;
      repeatBtn.appendChild(badge);
    }
    repeatBtn.setAttribute('title', 'Repeat: One');
    repeatBtn.setAttribute('aria-label', 'Repeat one track (active)');
  } else {
    if (badge) badge.remove();
    repeatBtn.setAttribute('title', isActive ? 'Repeat: All' : 'Repeat');
    repeatBtn.setAttribute('aria-label',
      isActive ? 'Repeat all tracks (active)' : 'Repeat');
  }
}

/* ============================================================
   6. PLAYBACK CORE
   ============================================================ */

/**
 * Loads the song at `index` into the Audio element.
 * If `autoPlay` is true, immediately starts playback.
 */
function loadTrack(index, autoPlay = false) {
  currentIndex    = index;
  const song      = playlist[index];
  audio.src       = song.src;
  audio.load();
  renderTrack(index);

  if (autoPlay) {
    playAudio();
  } else {
    // Keep the play button in the paused state
    isPlaying = false;
    renderPlayState(false);
  }
}

/**
 * Starts playback. Handles the promise returned by audio.play()
 * to suppress browser console warnings on auto-play restrictions.
 */
function playAudio() {
  const promise = audio.play();
  if (promise !== undefined) {
    promise
      .then(() => {
        isPlaying = true;
        renderPlayState(true);
      })
      .catch((err) => {
        // Browser blocked autoplay — stay in paused state
        console.warn('Playback prevented by browser:', err.message);
        isPlaying = false;
        renderPlayState(false);
      });
  } else {
    isPlaying = true;
    renderPlayState(true);
  }
}

/**
 * Pauses playback.
 */
function pauseAudio() {
  audio.pause();
  isPlaying = false;
  renderPlayState(false);
}

/**
 * Toggles between play and pause.
 */
function togglePlayPause() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

/**
 * Advances to the next track, obeying shuffle / repeat modes.
 */
function playNext() {
  let nextIndex;

  if (isShuffled) {
    nextIndex = getShuffleIndex();
    shuffleHistory.push(nextIndex);
  } else {
    nextIndex = (currentIndex + 1) % playlist.length;
  }

  loadTrack(nextIndex, true);
}

/**
 * Goes back to the previous track.
 * If more than 3 s have elapsed, restarts the current track instead.
 */
function playPrev() {
  if (audio.currentTime > 3) {
    // Restart current track
    audio.currentTime = 0;
    if (!isPlaying) playAudio();
    return;
  }

  let prevIndex;
  if (isShuffled && shuffleHistory.length > 1) {
    // Go back in shuffle history
    shuffleHistory.pop();           // remove current
    prevIndex = shuffleHistory[shuffleHistory.length - 1];
    shuffleHistory.pop();           // will be re-added by loadTrack → playNext chain
    shuffleHistory.push(prevIndex);
  } else {
    prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  }

  loadTrack(prevIndex, isPlaying);
}

/* ============================================================
   7. AUDIO EVENT LISTENERS
   ============================================================ */

/**
 * timeupdate — fires ~4× per second while audio is playing.
 * We update the progress bar and current-time label here.
 */
audio.addEventListener('timeupdate', renderProgress);

/**
 * loadedmetadata — fired when the browser has read the audio headers
 * and knows the real duration. Update the total-duration label.
 */
audio.addEventListener('loadedmetadata', () => {
  const total = audio.duration;
  progressBarEl.max = total;
  progressBarEl.setAttribute('aria-valuemax', Math.floor(total));
  totalDurEl.textContent = formatTime(total);

  // Update playlist entry with real duration for accurate display
  playlist[currentIndex].durationSec = total;
});

/**
 * ended — fires when the track finishes.
 * Decides what to do based on repeatMode and shuffle.
 */
audio.addEventListener('ended', () => {
  if (repeatMode === 'one') {
    // Replay same track
    audio.currentTime = 0;
    playAudio();
  } else if (repeatMode === 'all') {
    playNext();
  } else {
    // 'none' — play next only if not on the last track
    const isLast = !isShuffled && currentIndex === playlist.length - 1;
    if (isLast) {
      // Reached the end of the playlist — stop
      isPlaying = false;
      renderPlayState(false);
      audio.currentTime = 0;
      renderProgress();
    } else {
      playNext();
    }
  }
});

/**
 * error — handle missing / broken audio src gracefully.
 */
audio.addEventListener('error', () => {
  console.warn(
    `Audio source not found for "${playlist[currentIndex].title}". ` +
    'Using placeholder duration. Add real audio files to the /audio/ folder.'
  );
  // Show the static duration from our data; progress stays at 0
  totalDurEl.textContent = playlist[currentIndex].duration;
  progressBarEl.max      = playlist[currentIndex].durationSec;
});

/* ============================================================
   8. CONTROL BUTTON HANDLERS
   ============================================================ */

// ── Play / Pause ──────────────────────────────────────────────
playPauseBtn.addEventListener('click', togglePlayPause);

// Keyboard: Space bar also toggles play/pause when not focused on a slider
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'BUTTON') return;  // let default behaviour run
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlayPause();
  }
  if (e.code === 'ArrowRight') { e.preventDefault(); playNext(); }
  if (e.code === 'ArrowLeft')  { e.preventDefault(); playPrev(); }
});

// ── Previous ──────────────────────────────────────────────────
prevBtn.addEventListener('click', playPrev);

// ── Next ──────────────────────────────────────────────────────
nextBtn.addEventListener('click', playNext);

// ── Shuffle ───────────────────────────────────────────────────
shuffleBtn.addEventListener('click', () => {
  isShuffled = !isShuffled;
  shuffleHistory = isShuffled ? [currentIndex] : [];

  shuffleBtn.classList.toggle('is-active', isShuffled);
  shuffleBtn.setAttribute('aria-pressed', String(isShuffled));
  shuffleBtn.setAttribute('title', isShuffled ? 'Shuffle: On' : 'Shuffle');
  shuffleBtn.setAttribute('aria-label',
    isShuffled ? 'Shuffle on (active)' : 'Shuffle');
});

// ── Repeat ────────────────────────────────────────────────────
// Cycles: none → all → one → none
repeatBtn.addEventListener('click', () => {
  if (repeatMode === 'none') {
    repeatMode = 'all';
    audio.loop = false;
  } else if (repeatMode === 'all') {
    repeatMode = 'one';
    audio.loop = true;   // let the browser handle single-track loop natively
  } else {
    repeatMode = 'none';
    audio.loop = false;
  }
  renderRepeatBtn();
});

/* ============================================================
   9. PROGRESS BAR — SEEKING
   ============================================================ */

/**
 * Allow the user to drag / click the progress bar to seek.
 * We update audio.currentTime on both `input` (dragging) and
 * `change` (mouse-up / final value) events.
 */
progressBarEl.addEventListener('input', () => {
  const seekTime = Number(progressBarEl.value);
  currentTimeEl.textContent = formatTime(seekTime);

  // Update fill immediately while dragging, without waiting for timeupdate
  const total = isFinite(audio.duration) ? audio.duration : playlist[currentIndex].durationSec;
  const pct   = total > 0 ? (seekTime / total) * 100 : 0;
  progressFillEl.style.width = `${clamp(pct, 0, 100)}%`;
});

progressBarEl.addEventListener('change', () => {
  audio.currentTime = Number(progressBarEl.value);
});

/* ============================================================
   10. VOLUME & MUTE
   ============================================================ */

/**
 * Volume slider — maps [0, 100] to audio.volume [0.0, 1.0].
 */
volumeBarEl.addEventListener('input', () => {
  const vol   = Number(volumeBarEl.value) / 100;
  audio.volume = vol;
  lastVolume   = vol > 0 ? vol : lastVolume;   // remember last non-zero volume

  // If user drags volume up from zero, unmute
  if (vol > 0 && isMuted) {
    isMuted = false;
    audio.muted = false;
    renderMuteIcon(false);
  }

  // If user drags volume to zero, show muted icon
  if (vol === 0) {
    isMuted = true;
    audio.muted = true;
    renderMuteIcon(true);
  }

  renderVolume(vol);
});

/**
 * Mute button — toggles audio.muted.
 * If unmuting and volume is 0, restore lastVolume.
 */
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  audio.muted = isMuted;

  if (isMuted) {
    renderVolume(0);
  } else {
    // Restore previous volume
    const restoreVol = lastVolume > 0 ? lastVolume : 0.5;
    audio.volume = restoreVol;
    renderVolume(restoreVol);
  }

  renderMuteIcon(isMuted);
});

/* ============================================================
   11. FAVORITE (HEART) TOGGLE
   ============================================================ */

favoriteBtn.addEventListener('click', () => {
  isFavorited = !isFavorited;
  favoriteBtn.classList.toggle('is-active', isFavorited);
  favoriteBtn.setAttribute('aria-pressed', String(isFavorited));
  favoriteBtn.setAttribute('aria-label',
    isFavorited ? 'Remove from favorites' : 'Add to favorites');

  // Trigger the pulse animation defined in CSS
  favoriteBtn.classList.remove('pulse');
  // Force a reflow so re-adding the class re-triggers the animation
  void favoriteBtn.offsetWidth;
  favoriteBtn.classList.add('pulse');
});

/* ============================================================
   12. QUEUE — CLICK TO PLAY A TRACK DIRECTLY
   ============================================================ */

queueItems.forEach((item, i) => {
  // Click to load & play that track
  item.addEventListener('click', () => {
    if (i === currentIndex) {
      // Clicking the active track — toggle play/pause
      togglePlayPause();
    } else {
      loadTrack(i, true);
    }
  });

  // Keyboard accessibility: Enter / Space to activate
  item.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      item.click();
    }
  });
});

/* ============================================================
   13. QUEUE PANEL TOGGLE (MOBILE)
   ============================================================ */

queueToggleBtn.addEventListener('click', () => {
  const isOpen = queuePanel.classList.toggle('queue-open');
  queueToggleBtn.classList.toggle('queue-open', isOpen);
  queueToggleBtn.setAttribute('aria-expanded', String(isOpen));
  queuePanel.setAttribute('aria-hidden', String(!isOpen));
});

/* ============================================================
   14. INITIALISE — set up the first track on page load
   ============================================================ */

(function init() {
  // Set initial volume on the Audio element
  audio.volume = lastVolume;

  // Render the first track (no autoplay — respects browser policies)
  loadTrack(0, false);

  // Sync the volume slider fill on load
  renderVolume(lastVolume);

  // Ensure repeat button reflects initial state
  renderRepeatBtn();

  console.log(
    `%cVibeFlow %c— ${playlist.length} tracks loaded`,
    'color:#a78bfa;font-weight:700;font-size:13px',
    'color:#94a3b8;font-size:13px'
  );
})();
