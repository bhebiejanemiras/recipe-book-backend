import { z } from "zod";

const text = z.string().trim().min(1);

// A recipe photo may be an external URL or a path to an image uploaded through
// the API (see uploadImageService). Storing the relative path keeps the recipe
// valid in every environment that shares the database.
const imageValue = z
  .string()
  .trim()
  .min(1, "Add a photo for your recipe")
  .refine(
    (value) => /^https?:\/\//i.test(value) || /^\/api\/recipes\/v1\/image\/[0-9a-f-]{36}$/i.test(value),
    "Use an uploaded photo or an HTTP/HTTPS image URL",
  );

const recipeBody = z.object({
  name: text,
  cuisine: text,
  mealType: z.array(text).min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  cookTimeMinutes: z.number().int().nonnegative().max(2147483647),
  tags: z.array(text),
  image: imageValue,
  ingredients: z.array(text).min(1),
  instructions: z.array(text).min(1),
});

const recipeParams = z.object({ id: z.uuid("Invalid recipe ID") });

export const createRecipeSchema = z.object({ body: recipeBody });
export const recipeIdSchema = z.object({ params: recipeParams });
export const updateRecipeSchema = z.object({
  params: recipeParams,
  body: recipeBody.partial().refine((body) => Object.keys(body).length > 0, "Provide at least one recipe field"),
});

// The client sends the selected file as a base64 data URL. 8,000,000 characters
// is a little over 5 MB of binary once decoded, which the service enforces.
export const uploadImageSchema = z.object({
  body: z.object({
    image: z.string().trim().min(1, "Choose an image to upload").max(8_000_000, "Image is too large"),
  }),
});

export const imageIdSchema = z.object({ params: z.object({ id: z.uuid("Invalid image ID") }) });

export type CreateRecipeInput = z.infer<typeof recipeBody>;
export type UpdateRecipeInput = Partial<CreateRecipeInput>;
