import React from 'react';
import { 
  Utensils, 
  Plane, 
  Home, 
  Zap, 
  ShoppingBag, 
  Film, 
  HeartPulse, 
  GraduationCap, 
  Landmark, 
  Fuel, 
  Apple, 
  User, 
  MoreHorizontal, 
  Sparkles,
  Tag,
  Coffee,
  Briefcase,
  Laptop,
  TrendingUp,
  Folder,
  Building2,
  Gift,
  Coins,
  Award,
  Percent,
  PiggyBank,
  Shield
} from 'lucide-react';

export const getCategoryIconComponent = (categoryName: string, iconName?: string) => {
  const normalized = (categoryName || '').toLowerCase().trim();
  
  if (iconName) {
    switch (iconName) {
      case 'Utensils': return Utensils;
      case 'Plane': return Plane;
      case 'Home': return Home;
      case 'Zap': return Zap;
      case 'ShoppingBag': return ShoppingBag;
      case 'Film': return Film;
      case 'HeartPulse': return HeartPulse;
      case 'GraduationCap': return GraduationCap;
      case 'Landmark': return Landmark;
      case 'Fuel': return Fuel;
      case 'Apple': return Apple;
      case 'User': return User;
      case 'Briefcase': return Briefcase;
      case 'Laptop': return Laptop;
      case 'TrendingUp': return TrendingUp;
      case 'Sparkles': return Sparkles;
      case 'Coffee': return Coffee;
      case 'Building2': return Building2;
      case 'Gift': return Gift;
      case 'Coins': return Coins;
      case 'Award': return Award;
      case 'Percent': return Percent;
      case 'PiggyBank': return PiggyBank;
      case 'Shield': return Shield;
    }
  }

  if (normalized.includes('food') || normalized.includes('dining')) return Utensils;
  if (normalized.includes('travel') || normalized.includes('transit') || normalized.includes('flight')) return Plane;
  if (normalized.includes('rent') || normalized.includes('housing')) return Home;
  if (normalized.includes('bill') || normalized.includes('utility') || normalized.includes('electricity')) return Zap;
  if (normalized.includes('shop') || normalized.includes('gadget') || normalized.includes('store')) return ShoppingBag;
  if (normalized.includes('entertainment') || normalized.includes('movie') || normalized.includes('game')) return Film;
  if (normalized.includes('health') || normalized.includes('medical') || normalized.includes('doctor')) return HeartPulse;
  if (normalized.includes('education') || normalized.includes('course') || normalized.includes('book')) return GraduationCap;
  if (normalized.includes('emi') || normalized.includes('loan') || normalized.includes('mortgage')) return Landmark;
  if (normalized.includes('fuel') || normalized.includes('gas') || normalized.includes('petrol')) return Fuel;
  if (normalized.includes('grocer') || normalized.includes('supermarket')) return Apple;
  if (normalized.includes('personal') || normalized.includes('self')) return User;
  
  // Income specific
  if (normalized.includes('salary')) return Briefcase;
  if (normalized.includes('freelance')) return Laptop;
  if (normalized.includes('business')) return Building2;
  if (normalized.includes('bonus')) return Award;
  if (normalized.includes('interest')) return Percent;
  if (normalized.includes('cashback')) return Coins;
  if (normalized.includes('gift')) return Gift;
  if (normalized.includes('invest')) return TrendingUp;

  return Tag;
};
