
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';

interface ManualEntryFormProps {
  barcode?: string;
  onSubmit: (data: any) => void;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ barcode, onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      barcode: barcode || "",
      name: "",
      category: "dairy",
      quantity: "1",
      unit: "pcs",
      expiryDate: new Date().toISOString().split('T')[0]
    }
  });
  
  const processForm = (data: any) => {
    // Process the form data
    const formattedData = {
      ...data,
      quantity: Number(data.quantity),
      id: uuidv4(),
      addedDate: new Date().toISOString().split('T')[0]
    };
    
    onSubmit(formattedData);
  };
  
  return (
    <form onSubmit={handleSubmit(processForm)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode (optional)</Label>
          <Input
            id="barcode"
            placeholder="Enter barcode"
            {...register("barcode")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            placeholder="Product name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select defaultValue="dairy" {...register("category")}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dairy">Dairy</SelectItem>
              <SelectItem value="meat">Meat</SelectItem>
              <SelectItem value="vegetables">Vegetables</SelectItem>
              <SelectItem value="fruits">Fruits</SelectItem>
              <SelectItem value="bakery">Bakery</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
              <SelectItem value="canned">Canned</SelectItem>
              <SelectItem value="drinks">Drinks</SelectItem>
              <SelectItem value="snacks">Snacks</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register("quantity", { 
                required: "Quantity is required",
                min: { value: 1, message: "Minimum quantity is 1" }
              })}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive">{errors.quantity.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select defaultValue="pcs" {...register("unit")}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">Piece(s)</SelectItem>
                <SelectItem value="kg">Kilogram(s)</SelectItem>
                <SelectItem value="g">Gram(s)</SelectItem>
                <SelectItem value="l">Liter(s)</SelectItem>
                <SelectItem value="ml">Milliliter(s)</SelectItem>
                <SelectItem value="pkg">Package(s)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date *</Label>
          <Input
            id="expiryDate"
            type="date"
            {...register("expiryDate", { required: "Expiry date is required" })}
          />
          {errors.expiryDate && (
            <p className="text-xs text-destructive">{errors.expiryDate.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input
            id="notes"
            placeholder="Additional notes"
            {...register("notes")}
          />
        </div>
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Item"}
      </Button>
    </form>
  );
};

export default ManualEntryForm;
