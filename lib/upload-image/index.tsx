import { openDB } from 'idb';
import styles from './styles.module.css'
import { useEffect, useState } from 'react';

const DB_NAME = 'khoa-dev';
const STORE_NAME = 'images';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

interface ImageItem {
  id: string;
  blob: Blob;
}

export const UploadImage = (props: React.ButtonHTMLAttributes<HTMLDivElement>) => {
  const { className, ...restProps } = props
  const [images, setImages] = useState<ImageItem[]>([]);

  const loadImages = async () => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const allImages: ImageItem[] = [];
    let cursor = await store.openCursor();

    while (cursor) {
      allImages.push(cursor.value);
      cursor = await cursor.continue();
    }
    setImages(allImages);
  };

  const saveImage = async (file: File) => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const id = Date.now().toString();
    await store.put({ id, blob: file });
    await tx.done;

    await loadImages();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => saveImage(file));
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className={`${className} ${styles.uploadImage}`} {...restProps}>
      <input type="file" accept="image/*" multiple onChange={handleFileChange} />
      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {images.map(image => {
          const url = URL.createObjectURL(image.blob);
          return (
            <img
              key={image.id}
              src={url}
              alt="Uploaded preview"
              style={{ maxWidth: 150, maxHeight: 150, objectFit: 'cover' }}
              onLoad={() => URL.revokeObjectURL(url)}
            />
          );
        })}
      </div>
    </div>
  );
}