importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBvShRfkT1pus9A2tM-6geO7aKVPkBytXY",
  authDomain: "notification-6b138.firebaseapp.com",
  projectId: "notification-6b138",
  storageBucket: "notification-6b138.appspot.com",
  messagingSenderId: "40822560860",
  appId: "1:40822560860:web:9c3766bee4468dcda02e99",
  measurementId: "G-4ZDD9ZDPB4"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
