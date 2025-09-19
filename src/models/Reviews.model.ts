import { Schema, model } from 'mongoose';
import { IReview } from '../shared/types/reviews';

// Review Schema
const reviewSchema = new Schema<IReview>({
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerType: { type: String, enum: ['passenger', 'driver'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    tags: { type: [String] }
}, {
    timestamps: true
});
reviewSchema.index({ rideId: 1 });
export const Review = model<IReview>('Review', reviewSchema);