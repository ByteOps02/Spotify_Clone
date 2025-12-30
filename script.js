

// --- LOGOUT FUNCTION ---
function logout() {
  localStorage.removeItem('spotifyIsLoggedIn');
  localStorage.removeItem('spotifyCurrentUser');
  window.location.href = 'Spotify Login_SignUp/login.html';
}

const playerState = {
  songs: [],
  currentIndex: 0,
  audio: null,
  isPlaying: false,
};

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
function main() {
  // Create song URLs from metadata
  playerState.songs = songMetadata.map(song => `songs/${song.filename}`);
  console.log("Available Songs:", playerState.songs);

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
  playerState.songs.forEach((song, index) => {
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

  if (playerState.songs.length === 0) {
    console.error("No songs found!");
    return;
  }

  // Auto-play the first song
  // playSong(0);
}

// Play Selected Song
function playSong(index) {
    if (localStorage.getItem('spotifyIsLoggedIn') !== 'true') {
        window.location.href = 'Spotify Login_SignUp/login.html';
        return;
    }
  if (index < 0 || index >= playerState.songs.length) return;

  playerState.currentIndex = index;

  // Stop the currently playing song
  if (playerState.audio) {
    playerState.audio.pause();
    playerState.audio.currentTime = 0;
  }

  // Create a new audio instance and play
  playerState.audio = new Audio(playerState.songs[playerState.currentIndex]);
  playerState.audio.volume = document.getElementById("volume-slider").value; // Set initial volume
  
  // Add event listeners before playing
  playerState.audio.addEventListener("timeupdate", updateProgressBar);
  playerState.audio.addEventListener("ended", playNext);
  playerState.audio.addEventListener("loadedmetadata", () => {
    updateSongInfo();
    updatePlayPauseButton(true);
    // Update total duration when metadata is loaded
    const totalTimeSpan = document.getElementById("total-time");
    if (totalTimeSpan && playerState.audio.duration && !isNaN(playerState.audio.duration)) {
      totalTimeSpan.textContent = formatTime(playerState.audio.duration);
    }
  });

  playerState.audio.play().catch(error => {
    console.error("Error playing audio:", error);
    // If autoplay fails, just update the UI
    updateSongInfo();
    updatePlayPauseButton(false);
  });
  
  playerState.isPlaying = true;

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
  if (!playerState.audio) return;

  if (playerState.isPlaying) {
    playerState.audio.pause();
    updatePlayPauseButton(false);
  } else {
    playerState.audio.play().catch(error => {
      console.error("Error playing audio:", error);
    });
    updatePlayPauseButton(true);
  }
  playerState.isPlaying = !playerState.isPlaying;
}

// Play Previous Song
function playPrevious() {
  playerState.currentIndex = (playerState.currentIndex - 1 + playerState.songs.length) % playerState.songs.length;
  playSong(playerState.currentIndex);
}

// Play Next Song
function playNext() {
  playerState.currentIndex = (playerState.currentIndex + 1) % playerState.songs.length;
  playSong(playerState.currentIndex);
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
  if (songInfo && playerState.currentIndex < songMetadata.length) {
    const metadata = songMetadata[playerState.currentIndex];
    songInfo.textContent = `${metadata.title} - ${metadata.artist}`;
  }
  
  // Update currently playing song in library
  updateCurrentlyPlayingSong();
}

// Highlight currently playing song in library
function updateCurrentlyPlayingSong() {
  const songItems = document.querySelectorAll(".songList ul li");
  songItems.forEach((item, index) => {
    if (index === playerState.currentIndex) {
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
    if (playerState.audio) {
      playerState.audio.volume = event.target.value;
    }
  });
}

// Progress Bar Functionality
const progressBar = document.getElementById("progress-bar");

function updateProgressBar() {
  if (playerState.audio) {
    const progressBar = document.getElementById("progress-bar");
    const currentTimeSpan = document.getElementById("current-time");
    const totalTimeSpan = document.getElementById("total-time");
    
    if (progressBar) {
      const currentTime = playerState.audio.currentTime;
      const duration = playerState.audio.duration;
      if (duration && !isNaN(duration)) {
        const progress = (currentTime / duration) * 100;
        progressBar.style.transform = `scaleX(${progress / 100})`;
      }
    }
    
    // Update time display
    if (currentTimeSpan) {
      currentTimeSpan.textContent = formatTime(playerState.audio.currentTime);
    }
    
    if (totalTimeSpan && playerState.audio.duration && !isNaN(playerState.audio.duration)) {
      totalTimeSpan.textContent = formatTime(playerState.audio.duration);
    }
  }
}

document.addEventListener("DOMContentLoaded", function() {
  main();

  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    if (localStorage.getItem('spotifyIsLoggedIn') === 'true') {
      authBtn.textContent = 'Logout';
      authBtn.onclick = logout;
    } else {
      authBtn.textContent = 'Log in/Sign Up';
      authBtn.onclick = function() {
        window.location.href = 'Spotify Login_SignUp/login.html';
      };
    }
  }

  document.querySelector('.hamburger').addEventListener('click', ()=>{
    document.querySelector('.left').style.left = "0"
  })
  
  document.querySelector('.close').addEventListener('click', ()=>{
    document.querySelector('.left').style.left = "-100%"
  })

  const progressContainer = document.querySelector(".progress");
  let isDragging = false;

  function seek(event) {
    if (playerState.audio) {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, clickX / rect.width)); // Ensure progress is between 0 and 1
      playerState.audio.currentTime = progress * playerState.audio.duration;
    }
  }

  if (progressContainer) {
    progressContainer.addEventListener("click", seek);

    progressContainer.addEventListener("mousedown", (event) => {
      isDragging = true;
      seek(event);
    });

    document.addEventListener("mousemove", (event) => {
      if (isDragging) {
        seek(event);
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }

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