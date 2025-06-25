import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount?: number; // ทำให้ optional
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange("")}
            className="whitespace-nowrap"
          >
            ทั้งหมด
          </Button>

          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="whitespace-nowrap"
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
              {category.productCount !== undefined && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.productCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
