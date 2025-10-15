import { VERCEL_URL } from "@env";
import { VaultItem } from "../types/vaultTypes";

const apiUrl = VERCEL_URL.startsWith("http") ? VERCEL_URL : `https://${VERCEL_URL}`;

/**
 * Fetch all vault items from backend
 */
export const fetchVaultItems = async (): Promise<VaultItem[]> => {
  try {
    const res = await fetch(`${apiUrl}/vault`);
    console.log("Response status:", res.status);
    if (!res.ok) throw new Error("Failed to fetch vault items");
    const data = await res.json();
    console.log("Fetched vault items:", data);

    // map backend fields to frontend fields
    return data.map((item: VaultItem) => ({
      id: item.id?.toString(),
      type: item.type,
      title: item.title,
      content: item.content,
      username: item.username,
      password: item.password, // still encrypted, frontend shows ••••••
      url: item.url,
      imageUri: item.image_url, // backend uses image_url
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
      imageUri: newItem.image_url,
    };
  } catch (error) {
    console.error("Error adding vault item:", error);
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
