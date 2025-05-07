
import { FoodItem } from "@/types/food";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getExpiryStatus, getStatusColor } from "@/utils/expiryUtils";
import { Trash, Pencil, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const status = getExpiryStatus(item.expiryDate);
  const statusColor = getStatusColor(status);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on the dropdown menu or its buttons
    if (!(e.target as Element).closest('.dropdown-action')) {
      navigate(`/item/${item.id}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden h-full cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
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
            <div className="dropdown-action">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 dropdown-action">
                    <MoreVertical size={16} className="dropdown-action" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dropdown-action">
                  <DropdownMenuItem
                    className="dropdown-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item.id);
                    }} 
                  >
                    <Pencil size={16} className="mr-2 dropdown-action" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive dropdown-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }} 
                  >
                    <Trash size={16} className="mr-2 dropdown-action" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Image if available */}
        {item.imageUrl && (
          <div className="mt-3 h-32 rounded-md overflow-hidden bg-gray-50 dark:bg-gray-800">
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-contain" 
            />
          </div>
        )}
        
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
