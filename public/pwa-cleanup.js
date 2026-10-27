// Retire only this app's legacy caches after the new worker activates.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("little-paws-static-"))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});
