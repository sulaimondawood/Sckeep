
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManualEntryFormProps {
  initialData?: {
    barcode?: string;
    name?: string;
    category?: string;
  };
  onSubmit: (data: any) => void;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    quantity: 1,
    unit: "pcs",
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 week
    addedDate: new Date().toISOString().split('T')[0], // Today's date
    barcode: initialData?.barcode || "",
    notes: ""
  });

  const categories = [
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Meat & Seafood", 
    "Pantry",
    "Frozen",
    "Beverages",
    "Snacks",
    "Bakery",
    "Other"
  ];

  const units = [
    "pcs", "kg", "g", "lbs", "oz", "L", "ml", "cups", "tbsp", "tsp", "boxes", "cans", "bottles", "packages"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange("quantity", parseFloat(e.target.value) || 1)}
            min="0.1"
            step="0.1"
            required
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit *</Label>
          <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="addedDate">Date Added *</Label>
        <Input
          id="addedDate"
          type="date"
          value={formData.addedDate}
          onChange={(e) => handleInputChange("addedDate", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="expiryDate">Expiry Date *</Label>
        <Input
          id="expiryDate"
          type="date"
          value={formData.expiryDate}
          onChange={(e) => handleInputChange("expiryDate", e.target.value)}
          required
        />
      </div>

      {initialData?.barcode && (
        <div>
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => handleInputChange("barcode", e.target.value)}
            placeholder="Barcode (scanned automatically)"
            readOnly
          />
        </div>
      )}

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Additional notes (optional)"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Add Item
      </Button>
    </form>
  );
};

export default ManualEntryForm;
