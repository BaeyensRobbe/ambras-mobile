const { supabase } = require("../utils/supabase");
const FileSystem = require("expo-file-system/legacy");
const ImageManipulator = require("expo-image-manipulator");
// const { API_BASE_URL } = require("@env");
const API_BASE_URL = "ambras-backend.vercel.app";

const apiUrl = API_BASE_URL.startsWith("http")
  ? API_BASE_URL
  : `https://${API_BASE_URL}`;

const PAGE_SIZE = 500;
const MAX_WIDTH = 1920; // max width for resized images
const WEBP_QUALITY = 0.85;

/* ------------------------------- utils ------------------------------- */

async function convertToWebP(uri, quality = WEBP_QUALITY, maxWidth = MAX_WIDTH) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }], // resize to max width
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.WEBP,
    }
  );
  return result.uri;
}

async function downloadTempFile(remoteUrl) {
  const localUri = `${FileSystem.cacheDirectory}${Date.now()}.jpg`;
  const { uri } = await FileSystem.downloadAsync(remoteUrl, localUri);
  return uri;
}

async function fileToUint8Array(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const binary = Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/* ------------------------------- migration ------------------------------- */

async function migrateWebPPhotos() {
  console.log("🚀 Starting WebP migration");

  let page = 0;
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: photos, error } = await supabase
      .from("Photo")
      .select(`
        id,
        url,
        lowResUrl,
        spotId,
        Spot!inner(status, name)
      `)
      .eq("Spot.status", "Approved")
      .range(from, to);

    if (error) {
      console.error("❌ [FETCH_ERROR]", error);
      break;
    }
    if (!photos || photos.length === 0) break;

    for (const photo of photos) {
      const spotName = photo.Spot?.name || "Unknown Spot";

      // Skip if already has WebP version
      if (photo.lowResUrl && photo.lowResUrl.endsWith(".webp")) {
        skipped++;
        continue;
      }

      try {
        // 1. Download original
        const originalUri = await downloadTempFile(photo.url);

        // 2. Convert to WebP and resize
        const webpUri = await convertToWebP(originalUri);

        // 3. Presign upload
        const fileName = `01_${photo.spotId}.webp`;
        const folderName = String(photo.spotId);
        const signRes = await fetch(`${apiUrl}/r2/sign-upload-webp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName,
            folderName,
            fileType: "image/webp",
          }),
        });

        if (!signRes.ok) throw new Error("presign_failed");
        const { uploadUrl, publicUrl } = await signRes.json();

        // 4. Upload WebP
        const fileBytes = await fileToUint8Array(webpUri);
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/webp" },
          body: fileBytes,
        });
        if (!uploadRes.ok) throw new Error("upload_failed");

        // 5. Update DB
        const { error: updateError } = await supabase
          .from("Photo")
          .update({ lowResUrl: publicUrl })
          .eq("id", photo.id);
        if (updateError) throw updateError;

        processed++;
        console.log(`✅ [DONE] photoId=${photo.id} spot="${spotName}"`);
      } catch (err) {
        failed++;
        console.error(`❌ [ERROR] photoId=${photo.id} spot="${spotName}"`, err);
      }
    }

    if (photos.length < PAGE_SIZE) break;
    page++;
  }

  console.log("\n📊 Migration summary");
  console.log(`✅ processed: ${processed}`);
  console.log(`⏭️ skipped:   ${skipped}`);
  console.log(`❌ failed:    ${failed}`);
  console.log("🎉 Migration finished");
}

// Run immediately if executed directly
if (require.main === module) {
  migrateWebPPhotos();
}

module.exports = { migrateWebPPhotos };
