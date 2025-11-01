import { VERCEL_URL, API_BASE_URL } from "@env";
import { VaultItem } from "../types/vaultTypes";

const apiUrl = VERCEL_URL.startsWith("http") ? VERCEL_URL : `https://${VERCEL_URL}`;
const imageApiUrl = API_BASE_URL.startsWith("http") ? API_BASE_URL : `https://${API_BASE_URL}/vault/signed-url`;

/**
 * Fetch all vault items from backend
 */
export const fetchVaultItems = async (): Promise<VaultItem[]> => {
  try {
    const res = await fetch(`${apiUrl}/vault`);
    if (!res.ok) throw new Error("Failed to fetch vault items");
    const data = await res.json();

    // map backend fields to frontend fields
    return data.map((item: VaultItem) => ({
      id: item.id?.toString(),
      type: item.type,
      title: item.title,
      content: item.content,
      username: item.username,
      password: item.password, // still encrypted, frontend shows ••••••
      url: item.url,
      image_url: item.image_url, // backend uses image_url
    }));
  } catch (error) {
    console.error("Error fetching vault items:", error);
    return [];
  }
};

/**
 * Add a new vault item
 */
export const addVaultItem = async (item: Omit<VaultItem, "id">): Promise<VaultItem | null> => {
  try {
    const res = await fetch(`${apiUrl}/vault`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error("Failed to add vault item");

    const newItem = await res.json();
    return {
      ...item,
      id: newItem.id.toString(),
      image_url: newItem.image_url,
    };
  } catch (error) {
    console.error("Error adding vault item:", error);
    return null;
  }
};

export const fetchSignedUrl = async (fileName: string): Promise<string | null> => {
  if (!fileName) return null;

  try {
    const res = await fetch(`${imageApiUrl}?file=${encodeURIComponent(fileName)}`);
    const json = await res.json();
    if (json.signedUrl) return json.signedUrl;
    console.error("No signedUrl returned for", fileName, json);
    return null;
  } catch (err) {
    console.error("Error fetching signed URL:", err);
    return null;
  }
};

/**
 * Update a vault item
 */
export const updateVaultItem = async (id: string, item: Omit<VaultItem, "id">): Promise<VaultItem | null> => {
  try {
    const res = await fetch(`${apiUrl}/vault/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error("Failed to update vault item");

    const updated = await res.json();
    return {
      ...item,
      id: updated.id.toString(),
      imageUri: updated.image_url,
    };
  } catch (error) {
    console.error("Error updating vault item:", error);
    return null;
  }
};

/**
 * Delete a vault item
 */
export const deleteVaultItem = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${apiUrl}/vault/${id}`, { method: "DELETE" });
    return res.ok;
  } catch (error) {
    console.error("Error deleting vault item:", error);
    return false;
  }
};

/**
 * Decrypt a password item
 */
export const decryptVaultPassword = async (id: string): Promise<string | null> => {
  try {
    const res = await fetch(`${apiUrl}/vault/${id}/decrypt`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to decrypt password");
    const data = await res.json();
    return data.password;
  } catch (error) {
    console.error("Error decrypting password:", error);
    return null;
  }
};
