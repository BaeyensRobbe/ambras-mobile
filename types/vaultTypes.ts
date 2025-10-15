export type VaultItem = {
  id?: number;
  type: "password" | "note" | "link" | "image";
  title: string;
  content?: string;
  username?: string;
  password?: string;
  url?: string;
  image_url?: string;
};
