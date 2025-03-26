import firebaseConfig from './firebaseConfig.js';

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);

// FirebaseUI config.
const uiConfig = {
  signInSuccessUrl: '/landing.html', // URL to redirect to after a successful sign-in.
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  tosUrl: 'https://www.example.com/terms', // Terms of service URL
  privacyPolicyUrl: 'https://www.example.com/privacy', // Privacy policy URL
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    },
    signInFailure: function(error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log("Email already exists, switching to sign-in mode");
        alert('This email already exists. Please sign in instead.');
        // Switch to sign-in mode
        const ui = new firebaseui.auth.AuthUI(auth);
        ui.start('#firebaseui-auth-container', {
          signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID
          ],
          signInFlow: 'popup'
        });
        return Promise.resolve();
      }
      // Add a specific error handler for incorrect password
      if (error.code === 'auth/wrong-password') {
        const email = document.querySelector('input[type="email"]').value;
        alert('Incorrect password. Would you like to reset your password?');
        // Provide an option to reset password
        if (confirm('Would you like to reset your password?')) {
          handleResetPassword(email);
        }
        return Promise.resolve();
      }
      console.error('Sign-in error:', error);
      return Promise.resolve();
    }
  }
};

// Initialize the FirebaseUI Widget using Firebase.
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');
  const ui = new firebaseui.auth.AuthUI(auth);
  ui.start('#firebaseui-auth-container', uiConfig);
});

// Monitor auth state
auth.onAuthStateChanged(user => {
  if (user) {
    if (user.emailVerified) {
      console.log(`Logged in as ${user.email}`);
      // Redirect to landing page
      window.location.href = '/landing.html';
    } else {
      console.log('Email not verified');
      user.sendEmailVerification().then(() => {
        alert('Verification email sent. Please check your inbox.');
      });
    }
  } else {
    console.log('No user');
  }
});

function handleSignIn(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(`Signed in as ${user.email}`);
            // Redirect to landing page
            window.location.href = '/landing.html';
        })
        .catch((error) => {
            console.error('Error signing in:', error);
            alert('Error signing in: ' + error.message);
        });
}

function handleSignUp(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            console.log(`Signed up as ${user.email}`);
            // Send email verification
            user.sendEmailVerification().then(() => {
                alert('Verification email sent. Please check your inbox.');
            });
        })
        .catch((error) => {
            console.error('Error signing up:', error);
            alert('Error signing up: ' + error.message);
        });
}

function handleResetPassword(email) {
    auth.sendPasswordResetEmail(email).then(() => {
        alert('Password reset email sent. Please check your inbox.');
    }).catch((error) => {
        console.error('Error sending password reset email:', error);
    });
}