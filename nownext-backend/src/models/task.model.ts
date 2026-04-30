import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 600,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    color: {
      type: String,
      default: '#dbeafe',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ userId: 1, order: 1 });

export const TaskModel = mongoose.model('Task', taskSchema);
