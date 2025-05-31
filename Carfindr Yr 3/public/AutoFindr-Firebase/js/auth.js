/* js/auth.js */
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert('Logged in');
    location.href = 'dashboard.html';
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    alert('Registered');
    location.href = 'login.html';
  } catch (err) {
    alert(err.message);
  }
  
});
document.getElementById('googleSignIn')?.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await firebase.auth().signInWithPopup(provider);
    alert(`Welcome, ${result.user.displayName}`);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert(error.message);
  }
});
