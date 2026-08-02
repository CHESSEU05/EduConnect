import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../config/database.js";
import { categoryService } from "../services/category.service.js";

const seedCategories = async (): Promise<void> => {
  try {
    await connectToDatabase();

    const result = await categoryService.seedDefaultCategories();

    console.log(
      `Category seed complete: ${result.created} created, ${result.updated} updated.`,
    );

    await disconnectFromDatabase();
  } catch (error) {
    console.error("Category seed failed.", error);
    await disconnectFromDatabase();
    process.exit(1);
  }
};

void seedCategories();
