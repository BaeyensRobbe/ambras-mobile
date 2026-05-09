import { supabase } from "../utils/supabase";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { API_BASE_URL } from "@env";

const apiUrl = API_BASE_URL.startsWith("http")
  ? API_BASE_URL
  : `https://${API_BASE_URL}`;

const PAGE_SIZE = 500;
const LOWRES_WIDTH = 640;
const LOWRES_QUALITY = 0.55;
const MAX_LOWRES_KB = 100;

/* ------------------------------- utils ------------------------------- */

async function createLowRes(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: LOWRES_WIDTH } }],
    {
      compress: LOWRES_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
  return result.uri;
}

async function downloadTempFile(remoteUrl: string): Promise<string> {
  const localUri = `${FileSystem.cacheDirectory}${Date.now()}.jpg`;
  const { uri } = await FileSystem.downloadAsync(remoteUrl, localUri);
  return uri;
}

async function fileSizeKb(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  return info.size ? info.size / 1024 : 0;
}

async function fileToUint8Array(uri: string): Promise<Uint8Array> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/* ------------------------------- migration ------------------------------- */

export async function migrateLowResPhotos() {
  console.log("🚀 Starting low-res migration");
  console.log(
    `⚙️ Settings: width=${LOWRES_WIDTH}, quality=${LOWRES_QUALITY}, maxLowResKb=${MAX_LOWRES_KB}, pageSize=${PAGE_SIZE}`
  );

  let page = 0;
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    console.log(`\n📦 [FETCH] page=${page} range=${from}-${to}`);

    const { data: photos, error } = await supabase
      .from("Photo")
      .select(
        `
      id,
      url,
      lowResUrl,
      spotId,
      Spot!inner (
        status,
        name
      )
    `
      )
      .eq("Spot.status", "Approved")
      .range(from, to);

    if (error) {
      console.error("❌ [FETCH_ERROR]", error);
      break;
    }

    if (!photos || photos.length === 0) {
      console.log("🏁 No more photos to process");
      break;
    }

    console.log(`📸 Retrieved ${photos.length} photos`);

    for (const photo of photos) {
      const spotName = photo.Spot?.name || "Unknown Spot";

      let needsLowRes = true;

      if (photo.lowResUrl) {
        // download existing lowres to check size
        try {
          const lowResTemp = await downloadTempFile(photo.lowResUrl);
          const sizeKb = await fileSizeKb(lowResTemp);

          if (sizeKb <= MAX_LOWRES_KB) {
            needsLowRes = false;
            skipped++;
            console.log(
              `⏭️ [SKIP] photoId=${photo.id} spot="${spotName}" reason=lowResOk (${Math.round(
                sizeKb
              )}kb)`
            );
          } else {
            console.log(
              `⚠️ [RECOMPRESS] photoId=${photo.id} spot="${spotName}" oldLowRes=${Math.round(
                sizeKb
              )}kb`
            );
          }
        } catch (err) {
          console.warn(
            `⚠️ [LOWRES_CHECK_FAILED] photoId=${photo.id} spot="${spotName}"`,
            err
          );
        }
      }

      if (!needsLowRes) continue;

      console.log(
        `➡️ [PROCESS] photoId=${photo.id} spotId=${photo.spotId} spot="${spotName}"`
      );

      try {
        // 1. download original
        const originalUri = await downloadTempFile(photo.url);
        console.log(`⬇️ [DOWNLOADED] photoId=${photo.id} spot="${spotName}"`);

        // 2. create low-res
        const lowResUri = await createLowRes(originalUri);
        const sizeKb = Math.round(await fileSizeKb(lowResUri));
        console.log(`🖼️ [LOWRES_CREATED] photoId=${photo.id} spot="${spotName}" size=${sizeKb}kb`);

        // 3. presign
        const fileName = `lowres_${photo.id}.jpg`;
        const folderName = String(photo.spotId);

        const signRes = await fetch(`${apiUrl}/r2/sign-upload-lowres`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName,
            folderName,
            fileType: "image/jpeg",
          }),
        });

        if (!signRes.ok) throw new Error("presign_failed");
        const { uploadUrl, publicUrl } = await signRes.json();

        // 4. upload
        const fileBytes = await fileToUint8Array(lowResUri);
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: fileBytes,
        });

        if (!uploadRes.ok) throw new Error("upload_failed");
        console.log(`☁️ [UPLOAD_OK] photoId=${photo.id} spot="${spotName}"`);

        // 5. update db
        const { error: updateError } = await supabase
          .from("Photo")
          .update({ lowResUrl: publicUrl })
          .eq("id", photo.id);

        if (updateError) throw new Error("db_update_failed");

        processed++;
        console.log(`✅ [DONE] photoId=${photo.id} spot="${spotName}"`);
      } catch (err) {
        failed++;
        console.error(
          `❌ [ERROR] photoId=${photo.id} spot="${spotName}" step=${
            (err as Error).message
          }`,
          err
        );
      }
    }

    if (photos.length < PAGE_SIZE) {
      console.log("🏁 Last page reached");
      break;
    }

    page++;
  }

  console.log("\n📊 Migration summary");
  console.log(`✅ processed: ${processed}`);
  console.log(`⏭️ skipped:   ${skipped}`);
  console.log(`❌ failed:    ${failed}`);
  console.log("🎉 Migration finished");
}
