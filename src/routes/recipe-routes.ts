import { Router } from "express";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { CsrfMiddleware } from "@/middlewares/csrf-middleware";
import { SchemaMiddleware } from "@/middlewares/schema-middleware";
import { RoleValidatorMiddleware } from "@/middlewares/role-validator-middleware";
import { RecipeController } from "@/controllers/recipe-controller";
import { createRecipeSchema, recipeIdSchema, updateRecipeSchema, uploadImageSchema, imageIdSchema } from "@/schema/recipe-schema";

const router = Router();
const authMiddleware = new AuthMiddleware();
const csrfMiddleware = new CsrfMiddleware();
const schemaMiddleware = new SchemaMiddleware();
const recipeController = new RecipeController();
const roleValidatorMiddleware = new RoleValidatorMiddleware();

// Public: serve an uploaded photo so it can be shown in an <img> tag.
router.get("/v1/image/:id", schemaMiddleware.validate(imageIdSchema), recipeController.getImage);

// ADMIN: view all users' recipes.
router.get("/v1/get-all-recipes", authMiddleware.execute, roleValidatorMiddleware.validate("ADMIN"), recipeController.getAllRecipes);

// USER: manage only their own recipes.
router.get("/v1/get-recipes", authMiddleware.execute, roleValidatorMiddleware.validate("USER"), recipeController.getRecipes);
router.get("/v1/get-recipe/:id", authMiddleware.execute, roleValidatorMiddleware.validate("USER"), schemaMiddleware.validate(recipeIdSchema), recipeController.getRecipe);
router.post("/v1/upload-image", authMiddleware.execute, csrfMiddleware.execute, roleValidatorMiddleware.validate("USER"), schemaMiddleware.validate(uploadImageSchema), recipeController.uploadImage);
router.post("/v1/create-recipe", authMiddleware.execute, csrfMiddleware.execute, roleValidatorMiddleware.validate("USER"), schemaMiddleware.validate(createRecipeSchema), recipeController.createRecipe);
router.post("/v1/update-recipe/:id", authMiddleware.execute, csrfMiddleware.execute, roleValidatorMiddleware.validate("USER"), schemaMiddleware.validate(updateRecipeSchema), recipeController.updateRecipe);
router.post("/v1/delete-recipe/:id", authMiddleware.execute, csrfMiddleware.execute, roleValidatorMiddleware.validate("USER"), schemaMiddleware.validate(recipeIdSchema), recipeController.deleteRecipe);

export default router;