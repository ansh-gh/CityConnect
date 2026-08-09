import { z } from 'zod';

export const createComplaintSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Please provide a more detailed description'),
    category: z.string().min(2, 'Category is required'),
});