import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WasteAnalytics } from '@/types/waste';
import { getWasteAnalytics } from '@/services/wasteTrackingService';
import { useAuth } from '@/context/AuthContext';
import { 
  TrendingDown, 
  Leaf, 
  DollarSign, 
  Trash2, 
  CheckCircle, 
  Heart,
  Recycle,
  Target
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import SetGoalsDialog from './SetGoalsDialog';

const WasteAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<WasteAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const data = await getWasteAnalytics(user.id, 30);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading waste analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load waste analytics</p>
      </div>
    );
  }

  const disposalData = [
    { name: 'Consumed', value: analytics.totalConsumed, color: '#10B981', icon: CheckCircle },
    { name: 'Wasted', value: analytics.totalWasted, color: '#EF4444', icon: Trash2 },
    { name: 'Donated', value: analytics.totalDonated, color: '#3B82F6', icon: Heart },
    { name: 'Composted', value: analytics.totalComposted, color: '#F59E0B', icon: Recycle }
  ].filter(item => item.value > 0);

  const categoryData = Object.entries(analytics.wastedByCategory).map(([category, value]) => ({
    name: category,
    value
  }));

  const totalItems = analytics.totalConsumed + analytics.totalWasted + analytics.totalDonated + analytics.totalComposted;
  const wastePercentage = totalItems > 0 ? (analytics.totalWasted / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Waste Analytics</h2>
          <p className="text-muted-foreground">Track your food waste and environmental impact</p>
        </div>
        <Button onClick={() => setShowGoalsDialog(true)}>
          <Target size={16} className="mr-2" />
          Set Goals
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Waste Reduction</p>
                <p className="text-2xl font-bold">{analytics.wasteReduction.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">items saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Carbon Saved</p>
                <p className="text-2xl font-bold">{analytics.carbonFootprint.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg CO₂</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Cost Savings</p>
                <p className="text-2xl font-bold">${analytics.costSavings.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Waste Rate</p>
                <p className="text-2xl font-bold">{wastePercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">of total food</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      {analytics.goalProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.goalProgress.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {goal.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <Badge variant={goal.percentage >= 100 ? 'default' : 'secondary'}>
                      {goal.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={goal.percentage} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{goal.current.toFixed(1)}</span>
                    <span>Target: {goal.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disposal Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Food Disposal Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {disposalData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={disposalData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {disposalData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {disposalData.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <Icon size={14} />
                        <span>{item.name}: {item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No disposal data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Waste by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Waste by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="space-y-3">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${(category.value / Math.max(...categoryData.map(c => c.value))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {category.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No waste data by category</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Waste Trend Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Waste Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.wasteOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Consumed"
                />
                <Line 
                  type="monotone" 
                  dataKey="wasted" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Wasted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <SetGoalsDialog 
        isOpen={showGoalsDialog}
        onClose={() => setShowGoalsDialog(false)}
        onGoalCreated={() => {
          setShowGoalsDialog(false);
          // Reload analytics to show new goals
          if (user) {
            getWasteAnalytics(user.id, 30).then(setAnalytics);
          }
        }}
      />
    </div>
  );
};

export default WasteAnalyticsDashboard;