// src/models/userModel.ts

import { Schema, model } from 'mongoose';
import { IUser } from '../shared/types/user';

const userSchema = new Schema<IUser>({
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    profilePictureUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
    role: { type: String, enum: ['passenger', 'driver', 'admin'], default: 'passenger' }, // Add this line
    lastLoginAt: { type: Date }
}, {
    timestamps: true
});

userSchema.index({ phoneNumber: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 }); // It's a good practice to index the role field for faster queries

export const User = model<IUser>('User', userSchema);