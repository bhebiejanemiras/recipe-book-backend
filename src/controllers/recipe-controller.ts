import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "@/middlewares/auth-middleware";
import { getRecipesService, getAllRecipesService, getRecipeService, createRecipeService, updateRecipeService, deleteRecipeService, uploadImageService, getImageService } from "@/services/recipes";
import { createRecipeSchema, updateRecipeSchema } from "@/schema/recipe-schema";

export class RecipeController {
  public getAllRecipes = async (_req: Request, res: Response) => {
    const result = await getAllRecipesService();
    return res.status(result.code).json(result);
  };

  public getRecipes = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getRecipesService(userId);
    return res.status(result.code).json(result);
  };

  public getRecipe = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getRecipeService(req.params.id as string, userId);
    return res.status(result.code).json(result);
  };

  public createRecipe = async (req: Request, res: Response) => {
    // Use parsed data to strip sample fields such as rating and client-supplied userId.
    const { body } = createRecipeSchema.parse({ body: req.body });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await createRecipeService(body, userId);
    return res.status(result.code).json(result);
  };

  public updateRecipe = async (req: Request, res: Response) => {
    const { body } = updateRecipeSchema.parse({ body: req.body, params: req.params });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await updateRecipeService(req.params.id as string, body, userId);
    return res.status(result.code).json(result);
  };

  public deleteRecipe = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await deleteRecipeService(req.params.id as string, userId);
    return res.status(result.code).json(result);
  };

  public uploadImage = async (req: Request, res: Response) => {
    const result = await uploadImageService(req.body.image as string);
    return res.status(result.code).json(result);
  };

  // Public: recipe photos are served straight to <img> tags without cookies.
  public getImage = async (req: Request, res: Response) => {
    const result = await getImageService(req.params.id as string);
    if (result.code !== 200) return res.status(result.code).json(result);

    res.setHeader("Content-Type", result.image.mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    // Helmet defaults Cross-Origin-Resource-Policy to "same-origin", which stops
    // browsers from loading the photo when the frontend is on a different origin
    // (for example localhost:5173 vs the API on :7000, or Vercel vs Render).
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    return res.send(result.image.buffer);
  };
}
