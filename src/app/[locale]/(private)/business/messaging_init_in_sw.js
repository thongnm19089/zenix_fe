'use client';
import { useEffect } from 'react';
import axios from 'axios';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAccessTokenFromCookie } from '@/utils/token';

const firebaseConfig = {
  apiKey: "AIzaSyBvShRfkT1pus9A2tM-6geO7aKVPkBytXY",
  authDomain: "notification-6b138.firebaseapp.com",
  projectId: "notification-6b138",
  storageBucket: "notification-6b138.appspot.com",
  messagingSenderId: "40822560860",
  appId: "1:40822560860:web:9c3766bee4468dcda02e99",
  measurementId: "G-4ZDD9ZDPB4"
};

const accessToken = getAccessTokenFromCookie();

const sendToken = async (token, accessToken) => {
  try {
    await axios.post(process.env.NEXT_PUBLIC_API_URL + "/apis/v1/save-firebase-token/",
      {
        firebase_token: token
      },
      {
        headers: {
          "Authorization": "Bearer " + accessToken
        }
      });
  } catch (err) {
    console.log(err);
  }
};

function FirebaseMessaging() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      navigator.serviceWorker.register(`${process.env.NEXT_PUBLIC_API_URL}/firebase-messaging-sw.js`)
        .then(function (registration) {
          console.log('Service Worker registration successful with scope: ', registration.scope);
        })
        .catch(function (err) {
          console.error('Service Worker registration failed: ', err);
        });
    }
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {  // Kiểm tra để đảm bảo đang chạy trên client
      if ('Notification' in window) {  // Kiểm tra xem Notification có được hỗ trợ
        console.log("Requesting permission...");
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);

            navigator.serviceWorker.register('/firebase-messaging-sw.js')
              .then((registration) => {
                console.log("Service Worker registered with scope:", registration.scope);

                getToken(messaging, {
                  vapidKey: 'BOfv-BzylU67cGbHC2nwaBK3NaT_g_DWtdrah4UrykP-p8AQMweDMZ_6FJfzUOUmWGgpBvDI7A3tPk3zKNvK7Vs',
                  serviceWorkerRegistration: registration,
                }).then((currentToken) => {
                  if (currentToken) {
                    sendToken(currentToken, accessToken);
                    console.log("Firebase Token:", currentToken);
                  } else {
                    console.log("Cannot get token");
                  }
                }).catch((err) => {
                  console.log('An error occurred while retrieving token. ', err);
                });
              }).catch((err) => {
                console.log('Service Worker registration failed: ', err);
              });

            onMessage(messaging, (payload) => {
              console.log('Message received. ', payload);
              // Customize notification here
              const notificationTitle = payload.notification.title;
              const notificationOptions = {
                body: payload.notification.body,
                icon: '/firebase-logo.png'
              };

              new Notification(notificationTitle, notificationOptions);
            });
          } else {
            console.log("Notification permission denied.");
          }
        });
      } else {
        console.error('This browser does not support notifications.');
      }
    }
  }, []);

  return null;
}

export default FirebaseMessaging;
