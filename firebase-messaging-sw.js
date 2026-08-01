/* Nurse Yossr — réception des push Firebase quand l'app est fermée. */
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyBxHBJNexCeZ40HSqOLsC5Xr0K3sFrE314",
  authDomain:        "nurse-yossr.firebaseapp.com",
  projectId:         "nurse-yossr",
  storageBucket:     "nurse-yossr.firebasestorage.app",
  messagingSenderId: "728514643834",
  appId:             "1:728514643834:web:ebb56805aa449de2bc78c3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const n = payload.notification || payload.data || {};
  self.registration.showNotification(n.title || "Nurse Yossr", {
    body: n.body || "C'est l'heure 🌸",
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    vibrate: [60, 40, 60],
    data: { page: (payload.data && payload.data.page) || "p-home" }
  });
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type:"window", includeUncontrolled:true }).then(list => {
    for(const c of list){ if("focus" in c) return c.focus(); }
    return clients.openWindow("./index.html");
  }));
});
