// backend/models/Expense.js
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
    {
        user: { // The seller who incurred the expense
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Expense title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        amount: {
            type: Number,
            required: [true, 'Expense amount is required'],
            min: [0.01, 'Amount must be positive'],
        },
        category: {
            type: String,
            required: [true, 'Expense category is required'],
            enum: [ // Define your allowed categories
                'materials', 'tools', 'packaging', 'shipping', 'marketing',
                'utilities', 'rent', 'labor', 'maintenance', 'fees', 'miscellaneous'
            ],
            default: 'miscellaneous',
        },
        type: { // Optional: Fixed vs Variable expense type
            type: String,
            enum: ['fixed', 'variable'],
            default: 'variable',
        },
        date: { // Date the expense occurred
            type: Date,
            required: [true, 'Expense date is required'],
            default: Date.now,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    }
);

// Optional: Index for faster querying by user and date
expenseSchema.index({ user: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;