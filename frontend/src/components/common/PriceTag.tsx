import { useUIStore } from '../../stores';
import { cn } from '../../lib/utils';

interface PriceTagProps {
  amount: number; // Input is always VND in mock data
  className?: string;
  isOldPrice?: boolean;
}

const EX_RATES = {
  VND: 1,
  USD: 1 / 25000,
  EUR: 1 / 27000,
};

export const PriceTag = ({ amount, className, isOldPrice = false }: PriceTagProps) => {
  const { currency } = useUIStore();
  
  const converted = amount * EX_RATES[currency];
  
  const formatter = new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  });

  return (
    <span
      className={cn(
        'font-bold',
        isOldPrice ? 'text-gray-400 line-through text-sm font-normal' : 'text-blue-600',
        className
      )}
    >
      {formatter.format(converted)}
    </span>
  );
};
