// Toggle between sign-in and sign-up forms with animation
const signinSignup = document.querySelector('.signin-signup');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToSignin = document.getElementById('switch-to-signin');

if (switchToSignup && switchToSignin && signinSignup) {
  switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    signinSignup.classList.add('show-signup');
    clearMessages();
  });
  switchToSignin.addEventListener('click', (e) => {
    e.preventDefault();
    signinSignup.classList.remove('show-signup');
    clearMessages();
  });
}

// Helper: Show error/success messages
function showMessage(form, msg, isError = true) {
  let msgDiv = form.querySelector('.form-message');
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.className = 'form-message';
    form.insertBefore(msgDiv, form.firstChild);
  }
  msgDiv.textContent = msg;
  msgDiv.style.color = isError ? '#ff4d4f' : '#1db954';
  msgDiv.style.marginBottom = '1rem';
  msgDiv.style.textAlign = 'center';
}
function clearMessages() {
  document.querySelectorAll('.form-message').forEach(el => el.remove());
}

// Signup logic
const signupForm = document.querySelector('.sign-up-form');
if (signupForm) {
  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessages();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    if (!username || !email || !password) {
      showMessage(signupForm, 'All fields are required.');
      return;
    }
    
    fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.message.includes('successful')) {
        showMessage(signupForm, data.message, false);
        setTimeout(() => {
          signinSignup.classList.remove('show-signup');
          clearMessages();
        }, 1200);
        signupForm.reset();
      } else {
        showMessage(signupForm, data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showMessage(signupForm, 'An error occurred. Please try again.');
    });
  });
}

// Login logic
const signinForm = document.querySelector('.sign-in-form');
if (signinForm) {
  signinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessages();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.message.includes('successful')) {
        localStorage.setItem('spotifyIsLoggedIn', 'true');
        localStorage.setItem('spotifyCurrentUser', JSON.stringify(data.user));
        showMessage(signinForm, data.message, false);
        setTimeout(() => {
          window.location.href = '../index.html'; // Change to your web player page
        }, 1200);
        signinForm.reset();
      } else {
        showMessage(signinForm, data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showMessage(signinForm, 'An error occurred. Please try again.');
    });
  });
}

// Optional: Logout function (call this on your web player page to log out)
// function logout() {
//   localStorage.removeItem('spotifyIsLoggedIn');
//   localStorage.removeItem('spotifyCurrentUser');
//   window.location.href = 'Spotify Login_SignUp/login.html';
// }
