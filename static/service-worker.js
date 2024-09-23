console.log("Service Worker Loaded...");
self.addEventListener("push", (e) => {
  console.log("Push Recieved...");
  const data = e.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "http://image.ibb.co/frYOFd/tmlogo.png",
  });
});
