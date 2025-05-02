
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    },
    {
      title: "Freeze Extras",
      description: "Freeze leftovers or excess fresh food before they spoil. Label them with the date to track their storage time."
    },
    {
      title: "Understand Date Labels",
      description: "'Best by' doesn't mean unsafe after that date. Learn to tell when food is actually spoiled versus just past its prime."
    },
    {
      title: "Creative Leftovers",
      description: "Transform leftovers into new meals like soups, stir-fries, or casseroles instead of throwing them away."
    },
    {
      title: "Compost Food Scraps",
      description: "Start composting inedible food scraps to reduce landfill waste and create nutrient-rich soil for plants."
    }
  ];

  const insights = [
    "Most food waste occurs in dairy products",
    "Weekend shopping leads to more waste",
    "Items with longer shelf life are less likely to expire",
    "Improper refrigerator organization increases waste",
    "Buying in bulk without a plan often leads to spoilage"
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
        <CardContent>
          <Carousel className="w-full max-w-xs mx-auto">
            <CarouselContent>
              {tips.map((tip) => (
                <CarouselItem key={tip.title}>
                  <Alert>
                    <AlertTitle>{tip.title}</AlertTitle>
                    <AlertDescription>{tip.description}</AlertDescription>
                  </Alert>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center mt-4 gap-2">
              <CarouselPrevious className="static transform-none h-8 w-8 opacity-70 hover:opacity-100" />
              <CarouselNext className="static transform-none h-8 w-8 opacity-70 hover:opacity-100" />
            </div>
          </Carousel>
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
