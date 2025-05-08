
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  barcode: z.string().optional(),
  quantity: z.coerce.number().positive({ message: "Quantity must be positive" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  expiryDate: z.date({ required_error: "Expiry date is required" }),
  notes: z.string().optional(),
  imageUrl: z.string().optional()
});

interface ManualEntryFormProps {
  initialData?: {
    barcode?: string;
    name?: string;
    category?: string;
    quantity?: number;
    unit?: string;
    expiryDate?: Date;
    notes?: string;
    imageUrl?: string;
  };
  onSubmit: (data: any) => void;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ initialData = {}, onSubmit }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.imageUrl || null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || '',
      category: initialData.category || '',
      barcode: initialData.barcode || '',
      quantity: initialData.quantity || 1,
      unit: initialData.unit || 'item',
      expiryDate: initialData.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
      notes: initialData.notes || '',
      imageUrl: initialData.imageUrl || ''
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    // Format the date as ISO string (YYYY-MM-DD)
    const formattedData = {
      ...values,
      expiryDate: values.expiryDate.toISOString().split('T')[0]
    };
    onSubmit(formattedData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setImagePreview(imageUrl);
      form.setValue('imageUrl', imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const categories = [
    "Dairy",
    "Meat",
    "Produce",
    "Bakery",
    "Canned Goods",
    "Frozen Foods",
    "Snacks",
    "Beverages",
    "Condiments",
    "Other"
  ];

  const units = [
    "item",
    "pack",
    "kg",
    "g",
    "l",
    "ml",
    "oz",
    "lb",
    "bottle",
    "box",
    "can",
    "jar"
  ];

  return (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="pr-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter barcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image upload field */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image (optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {imagePreview ? (
                        <div className="relative w-full h-40 mb-2 border rounded-md overflow-hidden">
                          <img 
                            src={imagePreview} 
                            alt="Product preview" 
                            className="w-full h-full object-contain"
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-1 right-1 h-8 w-8 p-0"
                            onClick={() => {
                              setImagePreview(null);
                              form.setValue('imageUrl', '');
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-40 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700">
                          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">Upload image</p>
                            </div>
                            <input 
                              id="file-upload" 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                      )}
                      <input type="hidden" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-4">Add Item</Button>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
};

export default ManualEntryForm;
