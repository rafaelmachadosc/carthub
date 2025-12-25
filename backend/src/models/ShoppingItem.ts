import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IShoppingItem extends Document {
  lista_id: Types.ObjectId;
  nome_produto: string;
  quantidade: number;
  valor_unitario?: number;
  comprado: boolean;
  incluido?: boolean; // Para lista de planejamento - marca se foi incluído na lista ativa
}

const ShoppingItemSchema: Schema = new Schema(
  {
    lista_id: {
      type: Schema.Types.ObjectId,
      ref: 'ShoppingList',
      required: true,
    },
    nome_produto: {
      type: String,
      required: true,
      trim: true,
    },
    quantidade: {
      type: Number,
      required: true,
      min: 1,
    },
    valor_unitario: {
      type: Number,
      min: 0,
    },
    comprado: {
      type: Boolean,
      default: false,
    },
    incluido: {
      type: Boolean,
      default: false,
    },
  }
);

// Criar índice apenas uma vez
ShoppingItemSchema.index({ lista_id: 1 });

export default mongoose.model<IShoppingItem>('ShoppingItem', ShoppingItemSchema);

