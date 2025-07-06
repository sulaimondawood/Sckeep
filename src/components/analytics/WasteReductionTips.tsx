
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Leaf, TrendingUp } from 'lucide-react';

interface WasteReductionTipsProps {
  itemsSaved: number;
  percentageImprovement: number;
}

const WasteReductionTips: React.FC<WasteReductionTipsProps> = ({ 
  itemsSaved, 
  percentageImprovement 
}) => {
  const tips = [
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Check expiry dates regularly",
      description: "Review your inventory weekly to prioritize items that are expiring soon."
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      title: "Use FIFO method",
      description: "First In, First Out - use older items before newer ones to reduce waste."
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Plan your meals",
      description: "Create meal plans based on what you have to ensure nothing goes to waste."
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Waste Reduction Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Items Saved</span>
              <Badge variant="secondary">{itemsSaved}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items currently in inventory that haven't expired
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Efficiency Rate</span>
              <Badge variant={percentageImprovement >= 80 ? "default" : "secondary"}>
                {percentageImprovement}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of items that are still fresh
            </p>
          </div>

          {percentageImprovement >= 80 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                🎉 Great job! You're managing your food inventory efficiently!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Waste Reduction Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5 text-primary">
                  {tip.icon}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tip.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WasteReductionTips;
