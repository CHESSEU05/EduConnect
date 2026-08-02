import type { HydratedDocument, Model, Types } from "mongoose";

export interface IReview {
  student: Types.ObjectId;
  course: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewDocument = HydratedDocument<IReview>;

export type ReviewModel = Model<IReview>;
