import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
  },
  { _id: true } // keep ObjectId for each member
);

const sharedGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("SharedGroup", sharedGroupSchema);
