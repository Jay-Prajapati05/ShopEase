import { Link, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Footprints,
  Tv,
  Watch,
  Flame,
} from "lucide-react";

/**
 * CategoryBar
 *
 * Flipkart-style category navigation strip with modern icon cards.
 * Provides instant 1-click filtering across all top e-commerce categories.
 */
const CATEGORIES = [
  {
    name: "For You",
    link: "/products?sort=rating_desc",
    icon: Sparkles,
    color: "text-amber-600 bg-amber-50 group-hover:bg-amber-100",
    badge: "Trending",
  },
  {
    name: "Mobiles",
    category: "Smartphones",
    link: "/products?category=Smartphones",
    icon: Smartphone,
    color: "text-blue-600 bg-blue-50 group-hover:bg-blue-100",
  },
  {
    name: "Laptops",
    category: "Laptops",
    link: "/products?category=Laptops",
    icon: Laptop,
    color: "text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100",
  },
  {
    name: "Audio",
    category: "Audio",
    link: "/products?category=Audio",
    icon: Headphones,
    color: "text-purple-600 bg-purple-50 group-hover:bg-purple-100",
  },
  {
    name: "Fashion",
    category: "Fashion",
    link: "/products?category=Fashion",
    icon: Shirt,
    color: "text-rose-600 bg-rose-50 group-hover:bg-rose-100",
  },
  {
    name: "Footwear",
    category: "Footwear",
    link: "/products?category=Footwear",
    icon: Footprints,
    color: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100",
  },
  {
    name: "Appliances",
    category: "Appliances",
    link: "/products?category=Appliances",
    icon: Tv,
    color: "text-cyan-600 bg-cyan-50 group-hover:bg-cyan-100",
  },
  {
    name: "Accessories",
    category: "Accessories",
    link: "/products?category=Accessories",
    icon: Watch,
    color: "text-orange-600 bg-orange-50 group-hover:bg-orange-100",
  },
  {
    name: "Mega Deals",
    link: "/products?sort=price_asc",
    icon: Flame,
    color: "text-red-600 bg-red-50 group-hover:bg-red-100",
    badge: "Sale",
  },
];

export default function CategoryBar({ activeCategory = "", onSelectCategory }) {
  const [searchParams] = useSearchParams();
  const currentCategoryParam = activeCategory || searchParams.get("category") || "";

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div
          className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 overflow-x-auto no-scrollbar py-3 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((item) => {
            const Icon = item.icon;
            const isSelected =
              item.category &&
              currentCategoryParam.toLowerCase() === item.category.toLowerCase();

            const handleClick = (e) => {
              if (onSelectCategory && item.category) {
                e.preventDefault();
                onSelectCategory(item.category);
              }
            };

            return (
              <Link
                key={item.name}
                to={item.link}
                onClick={handleClick}
                className={`group flex flex-col items-center flex-shrink-0 text-center gap-1.5 transition-all select-none cursor-pointer ${
                  isSelected ? "scale-105" : "hover:-translate-y-0.5 active:scale-95"
                }`}
              >
                {/* Icon Container with Badge */}
                <div className="relative">
                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center transition-all shadow-2xs ${
                      isSelected
                        ? "bg-brand-500 text-gray-950 ring-2 ring-brand-400 ring-offset-2"
                        : `${item.color} border border-gray-100`
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${
                        isSelected ? "text-gray-950" : ""
                      }`}
                    />
                  </div>

                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-xs scale-90 sm:scale-100">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Category Label */}
                <span
                  className={`text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap transition-colors ${
                    isSelected
                      ? "text-brand-800 font-black"
                      : "text-gray-700 group-hover:text-brand-700"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

