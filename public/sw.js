importScripts("https://unpkg.com/idb@7.0.2/build/umd.js");

const DB_NAME = "khoa-dev";
const STORE_NAME = "images";
const ETypeImage = {
  LOCAL_ONLY: "local-only",
  UPLOADING: "uploading",
  SYNCED: "synced",
  ERROR: "error",
};

// Khởi tạo IndexedDB
const getDB = async () => {
  return idb.openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
};

const uploadToServer = async (data) => {
  const form = new FormData();
  form.append("photo", data);

  try {
    const res = await fetch("http://localhost:4000/api/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status: ${res.status}`);
    }

    const result = await res.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
});

self.addEventListener("sync", async (event) => {
  console.log(`Successfully uploaded image: ${"unknown"}`);
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  const allImages = [];
  let cursor = await store.openCursor();

  while (cursor) {
    allImages.push(cursor.value);
    cursor = await cursor.continue();
  }

  for (const image of allImages) {
    try {
      await uploadToServer(image.blob);
      const writeTx = db.transaction(STORE_NAME, "readwrite");
      const writeStore = writeTx.objectStore(STORE_NAME);
      await writeStore.delete(image.id);
      await writeTx.done;
      console.log(`Deleted image ${image.id || "unknown"} from store`);
    } catch (error) {
      console.error(`Failed to upload image: ${image.id || "unknown"}`, error);
      try {
        const writeTx = db.transaction(STORE_NAME, "readwrite");
        const writeStore = writeTx.objectStore(STORE_NAME);
        await writeStore.put({ ...image, type: "ERROR" });
        await writeTx.done;
        console.log(`Updated image ${image.id || "unknown"} to type "ERROR"`);
      } catch (writeError) {
        console.error(
          `Failed to update image ${image.id || "unknown"} to ERROR:`,
          writeError
        );
      }
    }
  }
});
