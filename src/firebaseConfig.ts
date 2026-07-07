import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSy95_xCQP2AVALApLok2ChiMQ4uEKDHNU',
  authDomain: 'chhipa-samaj-jaipur.firebaseapp.com',
  projectId: 'chhipa-samaj-jaipur',
  storageBucket: 'chhipa-samaj-jaipur.firebasestorage.app',
  messagingSenderId: '1077880221076',
  appId: '1:1077880221076:web:13820b9d10faae3055f381',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
