import { Camera } from 'lucide-react';
import { cn, getPhotoUrl } from '@/lib/utils';

interface ProductPhotoProps {
  photo?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProductPhoto({ photo, name, size = 'md', className }: ProductPhotoProps) {
  const url = getPhotoUrl(photo);
  const sizeClass = {
    sm: 'w-12 h-12',
    md: 'w-full h-48',
    lg: 'w-full h-64',
  }[size];

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={cn(sizeClass, 'object-cover', size === 'sm' ? 'rounded-lg' : 'rounded-t-xl', className)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center gap-2',
        size === 'sm' ? 'rounded-lg' : '',
        className
      )}
    >
      <Camera className={cn('text-gray-400 dark:text-gray-500', size === 'sm' ? 'w-5 h-5' : 'w-10 h-10')} />
      {size !== 'sm' && (
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Nessuna foto</span>
      )}
    </div>
  );
}
