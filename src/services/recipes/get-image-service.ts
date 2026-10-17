import { ImageRepository } from "@/repositories/image-repository";

export type GetImageResult =
  | { code: 200; status: "success"; image: { mimeType: string; buffer: Buffer } }
  | { code: 404 | 500; status: "error"; message: string };

export async function getImageService(id: string): Promise<GetImageResult> {
  try {
    const imageRepository = new ImageRepository();
    const image = await imageRepository.findById(id);
    if (!image) return { code: 404, status: "error", message: "Image not found" };

    return {
      code: 200,
      status: "success",
      image: { mimeType: image.mimeType, buffer: Buffer.from(image.data, "base64") },
    };
  } catch (error) {
    console.error("getImageService Error", error);
    return { code: 500, status: "error", message: "Unable to get image" };
  }
}
