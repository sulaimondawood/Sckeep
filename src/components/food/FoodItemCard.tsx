
import { FoodItem } from "@/types/food";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getExpiryStatus, getStatusColor } from "@/utils/expiryUtils";
import { Trash, Edit, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
          <div className="flex items-center">
            <Badge variant={status === 'expired' ? 'outline' : 'default'} className={statusColor}>
              {status === 'expired' ? 'Expired' : 
               status === 'danger' ? 'Critical' : 
               status === 'warning' ? 'Soon' : 'Safe'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item.id)}>
                  <Edit size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
                  <Trash size={16} className="mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
      </CardContent>
    </Card>
  );
};

export default FoodItemCard;
