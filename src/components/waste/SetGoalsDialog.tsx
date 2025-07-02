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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createWasteGoal } from '@/services/wasteTrackingService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Target, TrendingDown, Leaf, DollarSign } from 'lucide-react';

interface SetGoalsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
}

const SetGoalsDialog: React.FC<SetGoalsDialogProps> = ({
  isOpen,
  onClose,
  onGoalCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goalType, setGoalType] = useState<'monthly_waste_reduction' | 'carbon_footprint_reduction' | 'cost_savings'>('monthly_waste_reduction');
  const [targetValue, setTargetValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const goalOptions = [
    {
      value: 'monthly_waste_reduction' as const,
      label: 'Waste Reduction',
      description: 'Reduce food waste by items saved',
      icon: TrendingDown,
      unit: 'items',
      placeholder: '10'
    },
    {
      value: 'carbon_footprint_reduction' as const,
      label: 'Carbon Footprint',
      description: 'Reduce carbon emissions from food waste',
      icon: Leaf,
      unit: 'kg CO₂',
      placeholder: '5.0'
    },
    {
      value: 'cost_savings' as const,
      label: 'Cost Savings',
      description: 'Save money by reducing waste',
      icon: DollarSign,
      unit: '$',
      placeholder: '50.00'
    }
  ];

  const selectedGoal = goalOptions.find(goal => goal.value === goalType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetValue) return;

    setIsLoading(true);
    try {
      const target = parseFloat(targetValue);
      if (isNaN(target) || target <= 0) {
        toast({
          title: 'Invalid target',
          description: 'Please enter a valid positive number.',
          variant: 'destructive'
        });
        return;
      }

      const result = await createWasteGoal(user.id, goalType, target);
      
      if (result) {
        toast({
          title: 'Goal created',
          description: `Your ${selectedGoal?.label.toLowerCase()} goal has been set.`
        });
        onGoalCreated();
        setTargetValue('');
      } else {
        throw new Error('Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create goal. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target size={20} />
            Set Waste Reduction Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goal-type">Goal Type</Label>
            <Select value={goalType} onValueChange={(value: any) => setGoalType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goalOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
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

          {selectedGoal && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <selectedGoal.icon size={16} />
                <span className="font-medium">{selectedGoal.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedGoal.description}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="target-value">
              Monthly Target {selectedGoal && `(${selectedGoal.unit})`}
            </Label>
            <Input
              id="target-value"
              type="number"
              step={goalType === 'cost_savings' ? '0.01' : goalType === 'carbon_footprint_reduction' ? '0.1' : '1'}
              placeholder={selectedGoal?.placeholder}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !targetValue} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetGoalsDialog;