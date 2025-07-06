import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FoodItem } from '@/types/food';
import { logItemDisposal } from '@/services/wasteTrackingService';
import { useToast } from '@/hooks/use-toast';
import { Trash2, CheckCircle, Heart, Recycle } from 'lucide-react';

interface WasteTrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: FoodItem | null;
  onSuccess: () => void;
}

const WasteTrackingDialog: React.FC<WasteTrackingDialogProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess
}) => {
  const [disposalType, setDisposalType] = useState<'wasted' | 'consumed' | 'donated' | 'composted'>('consumed');
  const [reason, setReason] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const disposalOptions = [
    {
      value: 'consumed' as const,
      label: 'Consumed',
      description: 'Used before expiry',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      value: 'wasted' as const,
      label: 'Wasted',
      description: 'Thrown away unused',
      icon: Trash2,
      color: 'text-red-600'
    },
    {
      value: 'donated' as const,
      label: 'Donated',
      description: 'Given to others',
      icon: Heart,
      color: 'text-blue-600'
    },
    {
      value: 'composted' as const,
      label: 'Composted',
      description: 'Composted or recycled',
      icon: Recycle,
      color: 'text-yellow-600'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsLoading(true);
    try {
      const cost = estimatedCost ? parseFloat(estimatedCost) : 0;
      
      const result = await logItemDisposal(
        item,
        disposalType,
        reason || undefined,
        cost
      );

      if (result) {
        toast({
          title: 'Disposal logged',
          description: `${item.name} has been marked as ${disposalType}.`
        });
        onSuccess();
        onClose();
        
        // Reset form
        setReason('');
        setEstimatedCost('');
        setDisposalType('consumed');
      } else {
        throw new Error('Failed to log disposal');
      }
    } catch (error) {
      console.error('Error logging disposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to log item disposal. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOption = disposalOptions.find(opt => opt.value === disposalType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Track Item Disposal</DialogTitle>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-muted-foreground">
                {item.quantity} {item.unit} • {item.category}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="disposal-type">How was this item disposed?</Label>
                <Select value={disposalType} onValueChange={(value: any) => setDisposalType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {disposalOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon size={16} className={option.color} />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {disposalType === 'wasted' && (
                <div>
                  <Label htmlFor="reason">Reason for waste (optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Expired, spoiled, forgot about it..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="cost">Estimated cost (optional)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Logging...' : 'Log Disposal'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WasteTrackingDialog;