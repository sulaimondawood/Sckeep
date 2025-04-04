
import { FoodItem } from "@/types/food";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getExpiryStatus, getStatusColor } from "@/utils/expiryUtils";
import { Trash, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FoodItemCardProps {
  item: FoodItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onEdit, onDelete }) => {
  const status = getExpiryStatus(item.expiryDate);
  const statusColor = getStatusColor(status);

  return (
    <Card className="overflow-hidden h-full">
      <div className={`h-2 ${statusColor}`} />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.category}</p>
          </div>
          <Badge variant={status === 'expired' ? 'outline' : 'default'} className={statusColor}>
            {status === 'expired' ? 'Expired' : 
             status === 'danger' ? 'Critical' : 
             status === 'warning' ? 'Soon' : 'Safe'}
          </Badge>
        </div>
        
        <div className="mt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Quantity:</span>
            <span>{item.quantity} {item.unit}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500">Expires:</span>
            <span className={status === 'expired' ? 'text-red-500' : ''}>
              {formatDate(item.expiryDate)}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500">Added:</span>
            <span>{formatDate(item.addedDate)}</span>
          </div>
          {item.barcode && (
            <div className="flex justify-between mt-1">
              <span className="text-gray-500">Barcode:</span>
              <span className="font-mono text-xs">{item.barcode}</span>
            </div>
          )}
        </div>
        
        {item.notes && (
          <p className="mt-2 text-sm text-gray-500 italic">"{item.notes}"</p>
        )}
        
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(item.id)}>
            <Edit size={16} className="mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
            <Trash size={16} className="mr-1" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodItemCard;
