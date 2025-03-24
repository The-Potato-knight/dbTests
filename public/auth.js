// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwbqVMt9eBUY8Jm3aFQhvpBRUwtY14jNM",
    authDomain: "authtest-fdfed.firebaseapp.com",
    projectId: "authtest-fdfed",
    storageBucket: "authtest-fdfed.firebasestorage.app",
    messagingSenderId: "27772888856",
    appId: "1:27772888856:web:16faef2570877787e1a06d",
    measurementId: "G-XH782W2QYM"
  };
  
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