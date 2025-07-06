
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface AnalyticsSummaryProps {
  totalItems: number;
  expiringItems: number;
  categoryCounts: { [key: string]: number };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1'];

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ 
  totalItems, 
  expiringItems, 
  categoryCounts 
}) => {
  // Convert categoryCounts to chart data
  const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
    name: category,
    value: count
  }));

  const expiryPercentage = totalItems > 0 ? Math.round((expiringItems / totalItems) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-sm text-muted-foreground">
            Items in your inventory
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expiring Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{expiringItems}</div>
          <p className="text-sm text-muted-foreground">
            {expiryPercentage}% of total items
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Object.keys(categoryCounts).length}</div>
          <p className="text-sm text-muted-foreground">
            Different categories
          </p>
        </CardContent>
      </Card>

      {categoryData.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsSummary;
