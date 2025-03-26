import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// FirebaseUI config.
const uiConfig = {
    signInSuccessUrl: '/landing.html', // URL to redirect to after a successful sign-in.
    signInOptions: [
        {
            provider: 'password',
            requireDisplayName: false
        }
    ],
    // Set this to true to display the email first and handle both sign-in and sign-up
    signInFlow: 'popup',
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
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
            console.log("Sign-in error:", error);
            
            if (error.code === 'auth/email-already-in-use') {
                console.log("Email already exists, switching to sign-in mode");
                alert('This email already exists. Please sign in instead.');
                
                // Get the email that was entered
                const emailInput = document.querySelector('input[type="email"]');
                const email = emailInput ? emailInput.value : '';
                
                // Create a new UI instance with sign-in configuration
                const ui = new firebaseui.auth.AuthUI(auth);
                ui.start('#firebaseui-auth-container', {
                    signInOptions: [
                        {
                            provider: 'password',
                            requireDisplayName: false
                        }
                    ],
                    signInFlow: 'popup',
                    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
                    // Pre-fill the email field
                    defaultEmail: email,
                    // Skip email entry since we already have it
                    emailSignUpHint: email
                });
                
                return Promise.resolve();
            }
            
            // Add a specific error handler for incorrect password
            if (error.code === 'auth/wrong-password') {
                const emailInput = document.querySelector('input[type="email"]');
                const email = emailInput ? emailInput.value : '';
                
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

// Add function to check if an email exists before rendering the UI
function checkExistingEmail(email) {
    return fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${firebaseConfig.apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            identifier: email,
            continueUri: window.location.href
        })
    })
    .then(response => response.json())
    .then(data => {
        return data.registered || false;
    })
    .catch(error => {
        console.error('Error checking existing email:', error);
        return false;
    });
}

// Modify the Initialize call to check for existing users
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const ui = new firebaseui.auth.AuthUI(auth);
    
    // Directly check if there's a stored email and show appropriate UI
    const storedEmail = localStorage.getItem('tempEmail');
    if (storedEmail) {
        // Clear the stored email
        localStorage.removeItem('tempEmail');
        
        // Check if this email exists
        checkExistingEmail(storedEmail).then(exists => {
            if (exists) {
                // Show sign-in UI with pre-filled email
                ui.start('#firebaseui-auth-container', {
                    ...uiConfig,
                    defaultEmail: storedEmail
                });
            } else {
                // Show regular UI
                ui.start('#firebaseui-auth-container', uiConfig);
            }
        });
    } else {
        // Show regular UI
        ui.start('#firebaseui-auth-container', uiConfig);
    }
});

// Monitor auth state
onAuthStateChanged(auth, user => {
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
            auth.signOut().then(() => {
                console.log('User signed out due to unverified email.');
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        }
    } else {
        console.log('No user');
    }
});

function handleSignIn(email, password) {
    signInWithEmailAndPassword(auth, email, password)
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
    createUserWithEmailAndPassword(auth, email, password)
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
    sendPasswordResetEmail(auth, email).then(() => {
        alert('Password reset email sent. Please check your inbox.');
    }).catch((error) => {
        console.error('Error sending password reset email:', error);
    });
}