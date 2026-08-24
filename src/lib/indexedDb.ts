/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const DB_NAME = 'sy_cms_large_assets_db';
const STORE_NAME = 'brand_pdfs';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Saves a brand or product's PDF/image details (Base64 URL, names, or arrays of URLs) to IndexedDB
 */
export async function saveBrandPdf(
  brandKey: string,
  pdfUrlOrData: string | { pdfUrl?: string; pdfName?: string; pdfUrls?: string[]; pdfNames?: string[] },
  pdfName?: string
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    let dataToStore: { pdfUrl?: string; pdfName?: string; pdfUrls?: string[]; pdfNames?: string[] };
    if (typeof pdfUrlOrData === 'string') {
      dataToStore = { pdfUrl: pdfUrlOrData, pdfName: pdfName || 'document.pdf' };
    } else {
      dataToStore = pdfUrlOrData;
    }

    store.put(dataToStore, brandKey);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Save brand PDF failed:', error);
    throw error;
  }
}

/**
 * Deletes a brand's PDF details from IndexedDB
 */
export async function deleteBrandPdf(brandKey: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(brandKey);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Delete brand PDF failed:', error);
    throw error;
  }
}

/**
 * Loads all stored brand/product PDFs from IndexedDB
 */
export async function loadAllBrandPdfs(): Promise<Record<string, { pdfUrl?: string; pdfName?: string; pdfUrls?: string[]; pdfNames?: string[] }>> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();
    const results: Record<string, { pdfUrl?: string; pdfName?: string; pdfUrls?: string[]; pdfNames?: string[] }> = {};

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results[cursor.key as string] = cursor.value;
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Load brand PDFs failed:', error);
    return {};
  }
}
