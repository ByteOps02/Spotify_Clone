// --- AUTHENTICATION CHECK ---
if (localStorage.getItem('spotifyIsLoggedIn') !== 'true') {
  window.location.href = 'Spotify Login_SignUp/login.html';
}

// --- LOGOUT FUNCTION ---
function logout() {
  localStorage.removeItem('spotifyIsLoggedIn');
  localStorage.removeItem('spotifyCurrentUser');
  window.location.href = 'Spotify Login_SignUp/login.html';
}

let songs = [];
let currentIndex = 0;
let audio = null;
let isPlaying = false;

// Song metadata - you can add more songs here
const songMetadata = [
  {
    filename: "Sun Saathiya - Full Song - Disney's ABCD 2  Varun Dhawan - Shraddha Kapoor  Sachin - Jigar - Zee Music Company.mp3",
    title: "Sun Saathiya",
    artist: "Sachin-Jigar, Priya Saraiya"
  },
  {
    filename: "Achyutam-Keshavam-Shreya-Ghoshal.mp3",
    title: "Achyutam Keshavam",
    artist: "Shreya Ghoshal"
  }
];

// Function to shorten song name
function shortenName(name) {
  let length = Math.ceil(name.length * 0.2); // 20% of total length
  return name.length > length ? name.substring(0, length) + "..." : name;
}

// Function to format time in MM:SS format
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Load Songs into UI
async function main() {
  // Create song URLs from metadata
  songs = songMetadata.map(song => `songs/${song.filename}`);
  console.log("Available Songs:", songs);

  let library = document.querySelector(".library");
  if (!library) {
    console.error("Library section not found!");
    return;
  }

  let songList = library.querySelector(".songList ul");
  if (!songList) {
    console.error("Song list not found!");
    return;
  }

  // Clear existing content except the first li (which is the template)
  let existingItems = songList.querySelectorAll("li:not(:first-child)");
  existingItems.forEach(item => item.remove());

  // Add songs to the library
  songs.forEach((song, index) => {
    const metadata = songMetadata[index];
    
    let li = document.createElement("li");
    li.dataset.index = index;

    let musicIcon = document.createElement("img");
    musicIcon.className = "invert";
    musicIcon.src = "img/music.svg";
    musicIcon.alt = "";

    let infoDiv = document.createElement("div");
    infoDiv.className = "info";
    
    let titleDiv = document.createElement("div");
    titleDiv.textContent = metadata.title;
    
    let artistDiv = document.createElement("div");
    artistDiv.textContent = metadata.artist;

    infoDiv.appendChild(titleDiv);
    infoDiv.appendChild(artistDiv);

    let playNowDiv = document.createElement("div");
    playNowDiv.className = "playnow";
    playNowDiv.innerHTML = '<span>Play Now</span><img class="invert" src="img/play.svg" alt="PlayBtn">';
    playNowDiv.addEventListener("click", () => playSong(index));

    li.appendChild(musicIcon);
    li.appendChild(infoDiv);
    li.appendChild(playNowDiv);

    songList.appendChild(li);
  });

  if (songs.length === 0) {
    console.error("No songs found!");
    return;
  }

  // Auto-play the first song
  // playSong(0);
}

// Play Selected Song
function playSong(index) {
  if (index < 0 || index >= songs.length) return;

  currentIndex = index;

  // Stop the currently playing song
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  // Create a new audio instance and play
  audio = new Audio(songs[currentIndex]);
  audio.volume = document.getElementById("volume-slider").value; // Set initial volume
  
  // Add event listeners before playing
  audio.addEventListener("timeupdate", updateProgressBar);
  audio.addEventListener("ended", playNext);
  audio.addEventListener("loadedmetadata", () => {
    updateSongInfo();
    updatePlayPauseButton(true);
    // Update total duration when metadata is loaded
    const totalTimeSpan = document.getElementById("total-time");
    if (totalTimeSpan && audio.duration && !isNaN(audio.duration)) {
      totalTimeSpan.textContent = formatTime(audio.duration);
    }
  });

  audio.play().catch(error => {
    console.error("Error playing audio:", error);
    // If autoplay fails, just update the UI
    updateSongInfo();
    updatePlayPauseButton(false);
  });
  
  isPlaying = true;

  // Reset progress bar and time display
  const progressBar = document.getElementById("progress-bar");
  const currentTimeSpan = document.getElementById("current-time");
  const totalTimeSpan = document.getElementById("total-time");
  
  if (progressBar) {
    progressBar.style.transform = "scaleX(0)";
  }
  
  if (currentTimeSpan) {
    currentTimeSpan.textContent = "0:00";
  }
  
  if (totalTimeSpan) {
    totalTimeSpan.textContent = "0:00";
  }
}

// Toggle Play/Pause
function togglePlayPause() {
  if (!audio) return;

  if (isPlaying) {
    audio.pause();
    updatePlayPauseButton(false);
  } else {
    audio.play().catch(error => {
      console.error("Error playing audio:", error);
    });
    updatePlayPauseButton(true);
  }
  isPlaying = !isPlaying;
}

// Play Previous Song
function playPrevious() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playSong(currentIndex);
}

// Play Next Song
function playNext() {
  currentIndex = (currentIndex + 1) % songs.length;
  playSong(currentIndex);
}

// Update Play/Pause Button Icon
function updatePlayPauseButton(isPlaying) {
  let playBtn = document.querySelector(".playbtn");
  if (playBtn) {
    playBtn.src = isPlaying ? "img/pause.svg" : "img/play.svg";
  }
}

// Update Song Info Display
function updateSongInfo() {
  let songInfo = document.querySelector(".songinfo");
  if (songInfo && currentIndex < songMetadata.length) {
    const metadata = songMetadata[currentIndex];
    songInfo.textContent = `${metadata.title} - ${metadata.artist}`;
  }
  
  // Update currently playing song in library
  updateCurrentlyPlayingSong();
}

// Highlight currently playing song in library
function updateCurrentlyPlayingSong() {
  const songItems = document.querySelectorAll(".songList ul li");
  songItems.forEach((item, index) => {
    if (index === currentIndex) {
      item.classList.add("playing");
    } else {
      item.classList.remove("playing");
    }
  });
}

// Volume Control
const volumeSlider = document.getElementById("volume-slider");
if (volumeSlider) {
  volumeSlider.addEventListener("input", (event) => {
    if (audio) {
      audio.volume = event.target.value;
    }
  });
}

// Progress Bar Functionality
const progressBar = document.getElementById("progress-bar");

function updateProgressBar() {
  if (audio) {
    const progressBar = document.getElementById("progress-bar");
    const currentTimeSpan = document.getElementById("current-time");
    const totalTimeSpan = document.getElementById("total-time");
    
    if (progressBar) {
      const currentTime = audio.currentTime;
      const duration = audio.duration;
      if (duration && !isNaN(duration)) {
        const progress = (currentTime / duration) * 100;
        progressBar.style.transform = `scaleX(${progress / 100})`;
      }
    }
    
    // Update time display
    if (currentTimeSpan) {
      currentTimeSpan.textContent = formatTime(audio.currentTime);
    }
    
    if (totalTimeSpan && audio.duration && !isNaN(audio.duration)) {
      totalTimeSpan.textContent = formatTime(audio.duration);
    }
  }
}

// Add click event for progress bar seeking
document.addEventListener("DOMContentLoaded", function() {
  const progressContainer = document.querySelector(".progress");
  if (progressContainer) {
    progressContainer.addEventListener("click", (event) => {
      if (audio) {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const progress = clickX / rect.width;
        audio.currentTime = progress * audio.duration;
      }
    });
  }
});

// Event Listeners for Playbar Controls
document.addEventListener("DOMContentLoaded", function() {
  const playBtn = document.querySelector(".playbtn");
  const prevBtn = document.querySelector(".prevsong");
  const nextBtn = document.querySelector(".nextsong");

  if (playBtn) {
    playBtn.addEventListener("click", togglePlayPause);
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", playPrevious);
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", playNext);
  }
});

// Add the waveform animation script
function createWaveform() {
  const waveform = document.getElementById("waveform");
  if (waveform) {
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement("div");
      bar.classList.add("bar");
      bar.style.animationDelay = `${i * 0.1}s`;
      waveform.appendChild(bar);
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  createWaveform();
  main();
});