import mongoose, { Schema, Document } from 'mongoose';

export interface IShoppingList extends Document {
  usuario_email: string;
  tipo: 'planejamento' | 'ativa';
  status: 'ativa' | 'finalizada';
  data_criacao: Date;
  data_finalizacao?: Date;
  valor_total?: number;
}

const ShoppingListSchema: Schema = new Schema(
  {
    usuario_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: ['planejamento', 'ativa'],
      required: true,
      default: 'ativa',
      index: true,
    },
    status: {
      type: String,
      enum: ['ativa', 'finalizada'],
      default: 'ativa',
      index: true,
    },
    data_criacao: {
      type: Date,
      default: Date.now,
      index: true,
    },
    data_finalizacao: {
      type: Date,
    },
    valor_total: {
      type: Number,
      min: 0,
    },
  }
);

ShoppingListSchema.index({ usuario_email: 1, tipo: 1, status: 1 });
ShoppingListSchema.index({ usuario_email: 1, data_finalizacao: -1 });

export default mongoose.model<IShoppingList>('ShoppingList', ShoppingListSchema);

