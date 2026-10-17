import { ImageRepository } from "@/repositories/image-repository";

const MAX_BYTES = 5 * 1024 * 1024;

export type UploadImageResult = {
  code: number;
  status: string;
  message?: string;
  data?: { url: string };
};

// file-type signatures so a renamed file cannot masquerade as an image.
function matchesSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/png") return buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  if (mimeType === "image/jpeg") return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (mimeType === "image/gif") return buffer.subarray(0, 4).toString("latin1").startsWith("GIF8");
  if (mimeType === "image/webp") {
    return buffer.subarray(0, 4).toString("latin1") === "RIFF" && buffer.subarray(8, 12).toString("latin1") === "WEBP";
  }
  return false;
}

export async function uploadImageService(dataUrl: string): Promise<UploadImageResult> {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl.trim());
  if (!match) return { code: 400, status: "error", message: "Upload a valid image file" };

  const mimeType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  if (!allowed.includes(mimeType)) {
    return { code: 400, status: "error", message: "Only PNG, JPG, WEBP or GIF images are allowed" };
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || !matchesSignature(buffer, mimeType)) {
    return { code: 400, status: "error", message: "Upload a valid image file" };
  }
  if (buffer.length > MAX_BYTES) {
    return { code: 413, status: "error", message: "Image must be 5 MB or smaller" };
  }

  try {
    const imageRepository = new ImageRepository();
    const image = await imageRepository.create({ mimeType, data: buffer.toString("base64"), size: buffer.length });
    return { code: 201, status: "success", data: { url: `/api/recipes/v1/image/${image.id}` } };
  } catch (error) {
    console.error("uploadImageService Error", error);
    return { code: 500, status: "error", message: "Unable to upload image" };
  }
}
