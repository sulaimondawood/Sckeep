
import { ExpiryStatus } from "@/types/food";

export const calculateDaysRemaining = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  // Reset time parts to compare dates only
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  
  const differenceMs = expiry.getTime() - today.getTime();
  return Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDate: string): ExpiryStatus => {
  const daysRemaining = calculateDaysRemaining(expiryDate);
  
  if (daysRemaining < 0) {
    return 'expired';
  } else if (daysRemaining <= 3) {
    return 'danger';
  } else if (daysRemaining <= 7) {
    return 'warning';
  } else {
    return 'safe';
  }
};

export const getStatusColor = (status: ExpiryStatus): string => {
  switch (status) {
    case 'safe':
      return 'bg-success text-white';
    case 'warning':
      return 'bg-warning text-black';
    case 'danger':
      return 'bg-danger text-white';
    case 'expired':
      return 'bg-gray-400 text-white';
    default:
      return 'bg-gray-200 text-black';
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
