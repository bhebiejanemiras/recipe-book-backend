import { eq } from "drizzle-orm";
import { db } from "@/db";
import { images } from "@/db/schema";

export class ImageRepository {
  async create(data: { mimeType: string; data: string; size: number }) {
    const [image] = await db.insert(images).values(data).returning();
    return image;
  }

  async findById(id: string) {
    const [image] = await db.select().from(images).where(eq(images.id, id)).limit(1);
    return image;
  }
}
