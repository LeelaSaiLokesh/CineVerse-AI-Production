import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqukYHRJsvomz7oUVXuH7n8Kc24rejoro",
  authDomain: "cineverseai-cca20.firebaseapp.com",
  projectId: "cineverseai-cca20",
  storageBucket: "cineverseai-cca20.firebasestorage.app",
  messagingSenderId: "1013137656114",
  appId: "1:1013137656114:web:d1d711e00444cd2d872f2b",
};

let app;
let auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app as firebaseApp, auth, googleProvider };