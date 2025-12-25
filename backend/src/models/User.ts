import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  nome: string;
  foto_perfil?: string;
  data_cadastro: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    nome: {
      type: String,
      required: true,
    },
    foto_perfil: {
      type: String,
    },
    data_cadastro: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.model<IUser>('User', UserSchema);

