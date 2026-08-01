/* Nurse Yossr — réception des push Firebase quand l'app est fermée.
   Remplace la config ci-dessous par LA MÊME que dans index.html. */
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "COLLE_TON_API_KEY",
  authDomain:        "COLLE_TON_PROJET.firebaseapp.com",
  projectId:         "COLLE_TON_PROJECT_ID",
  storageBucket:     "COLLE_TON_PROJET.appspot.com",
  messagingSenderId: "COLLE_TON_SENDER_ID",
  appId:             "COLLE_TON_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const n = payload.notification || payload.data || {};
  self.registration.showNotification(n.title || "Nurse Yossr", {
    body: n.body || "C'est l'heure 🌸",
    icon: "../icons/icon-192.png",
    badge: "../icons/icon-192.png",
    vibrate: [60, 40, 60],
    data: { page: (payload.data && payload.data.page) || "p-home" }
  });
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type:"window", includeUncontrolled:true }).then(list => {
    for(const c of list){ if("focus" in c) return c.focus(); }
    return clients.openWindow("../index.html");
  }));
});
