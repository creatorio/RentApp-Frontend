import { onMount } from "svelte";
let urlBase64ToUint8Array;
let send;
let subscription;
console.log(navigator);
urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
const publicVapidKey =
  "BMG1_Cwy8C_JRweiURMlkCiYsdmfzzMfjt_fPk1QOUGBdssQJGpuy2rmrSobDQ0ZztHAzFzfNDTn34n_3QmroGM";
// Register SW, Register Push, Send Push
send = async (body, day, month, id, idd) => {
  console.log("serviceWorker" in navigator,)
  if ("serviceWorker" in navigator) {
    // Register Service Worker
    console.log("Registering service worker...");
    var register = await navigator.serviceWorker.register(
      "http://localhost:5173/service-worker.js"
    );
    console.log("Service Worker Registered...");

    // Register Push
    console.log("Registering Push...");
    try {
      subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
    } catch (e) {
      try {
        subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
      } catch (er) {
        try {
          subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });
        } catch (err) {
          subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });
        }
      }
    }
    console.log("Push Registered...");

    // Send Push Notification
    console.log("Sending Push...");
    await fetch("http://127.0.0.1:3000/subscribe", {
      method: "POST",
      body: JSON.stringify({
        id: id,
        idd: idd,
        sub: subscription,
        day: day,
        month: month,
        notif: JSON.stringify({ title: "Rent Manager", body: body }),
      }),
      headers: {
        "content-type": "application/json",
      },
    });
    console.log("Push Sent...");
  }
};
async function sendmonpa(paid, id) {
  if (!paid) {
    return;
  }
  await fetch("http://127.0.0.1:3000/subscribe", {
    method: "POST",
    body: JSON.stringify({
      sub: id,
      paid: paid,
    }),
    headers: {
      "content-type": "application/json",
    },
  });
  console.log("paid sent");
}
async function senddelete(id) {
  await fetch("http://127.0.0.1:3000/subscribe", {
    method: "POST",
    body: JSON.stringify({
      sub: id,
      deleted: true,
    }),
    headers: {
      "content-type": "application/json",
    },
  });
  console.log("deleted sent");
}

export default send;
export { sendmonpa, senddelete };
