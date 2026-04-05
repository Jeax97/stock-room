import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryQuickFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryQuickFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
}: CategoryQuickFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <button
        onClick={() => onCategoryChange('')}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
          selectedCategoryId === ''
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        )}
      >
        Tutte
      </button>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(String(category.id))}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
            selectedCategoryId === String(category.id)
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
