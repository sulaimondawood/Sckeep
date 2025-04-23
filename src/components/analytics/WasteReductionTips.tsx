
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

export const WasteReductionTips = () => {
  const tips = [
    {
      title: "Shop Smart",
      description: "Plan your meals in advance and make a shopping list to avoid overbuying. Check your inventory before shopping."
    },
    {
      title: "First In, First Out (FIFO)",
      description: "Store new items behind older ones to ensure older items are used first."
    },
    {
      title: "Proper Storage",
      description: "Learn the optimal storage conditions for different foods to maximize their shelf life."
    }
  ];

  const insights = [
    "Most food waste occurs in dairy products",
    "Weekend shopping leads to more waste",
    "Items with longer shelf life are less likely to expire"
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Waste Reduction Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tips.map((tip) => (
            <Alert key={tip.title}>
              <AlertTitle>{tip.title}</AlertTitle>
              <AlertDescription>{tip.description}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Behavior Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {index + 1}
                </div>
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
