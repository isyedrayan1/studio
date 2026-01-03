// ============================================
// FIREBASE STORAGE - IMAGE UPLOAD OPERATIONS
// ============================================

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from './config';

const storage = getStorage(app);

/**
 * Upload proof image for a score
 * @param matchId - Match ID
 * @param teamId - Team ID
 * @param file - Image file to upload
 * @returns Download URL of the uploaded image
 */
export async function uploadProofImage(
  matchId: string,
  teamId: string,
  file: File
): Promise<string> {
  // Create unique path: proof-images/{matchId}_{teamId}_{timestamp}.{ext}
  const ext = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const path = `proof-images/${matchId}_${teamId}_${timestamp}.${ext}`;
  
  const storageRef = ref(storage, path);
  
  // Upload the file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  
  // Get and return the download URL
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Delete a proof image
 * @param imageUrl - Full URL of the image to delete
 */
export async function deleteProofImage(imageUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting proof image:', error);
    // Don't throw - image might already be deleted
  }
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns true if valid, throws error if not
 */
export function validateProofImage(file: File): boolean {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
  }
  
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.');
  }
  
  return true;
}
