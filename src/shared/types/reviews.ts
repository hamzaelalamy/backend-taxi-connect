import { Document, Schema, model } from 'mongoose';

// Review
export interface IReview extends Document {
    rideId: Schema.Types.ObjectId;
    reviewerId: Schema.Types.ObjectId;
    revieweeId: Schema.Types.ObjectId;
    reviewerType: 'passenger' | 'driver';
    rating: number;
    comment?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}