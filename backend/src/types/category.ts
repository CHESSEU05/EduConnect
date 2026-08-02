import type { HydratedDocument, Model } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<ICategory>;

export type CategoryModel = Model<ICategory>;
