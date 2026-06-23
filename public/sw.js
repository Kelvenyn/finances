self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || "FinanceHub", { body: data.body || "Nova movimentação encontrada.", icon: "/favicon.ico" }));
});
self.addEventListener("notificationclick", (event) => { event.notification.close(); event.waitUntil(clients.openWindow("/review")); });

