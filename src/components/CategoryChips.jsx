import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CategoryChips - 横スクロール可能なカテゴリチップスコンポーネント
 * 
 * @component
 * @param {Object} props
 * @param {Array<string>} props.categories - 表示するカテゴリ配列
 * @param {string} props.activeCategory - 現在選択中のカテゴリ
 * @param {Function} props.onCategoryChange - カテゴリ選択時のコールバック関数
 * @param {boolean} [props.showArrows=true] - スクロール矢印を表示するか
 * @param {string} [props.bgColor='#faf3e8'] - 背景色
 * @returns {React.ReactElement}
 */
const CategoryChips = ({
  categories = [],
  activeCategory = '',
  onCategoryChange = () => {},
  showArrows = true,
  bgColor = '#faf3e8',
}) => {
  const scrollContainerRef = useRef(null);

  /**
   * スクロールコンテナを指定方向にスクロール
   * @param {number} direction - スクロール方向 (負=左, 正=右)
   */
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction * 140,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      className="sticky z-50 flex items-center gap-0"
      style={{
        top: '56px',
        backgroundColor: bgColor,
        borderBottom: '1px solid #ddd0bb',
      }}
    >
      {/* 左スクロール矢印 */}
      {showArrows && (
        <button
          onClick={() => handleScroll(-1)}
          aria-label="左へスクロール"
          className="flex-shrink-0 flex items-center justify-center text-gray-500 active:bg-gray-100 transition-colors duration-200"
          style={{ width: '32px', height: '46px' }}
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* チップスコンテナ */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide flex-1 items-center py-2 px-2 gap-2"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch', // 慣性スクロール対応
        }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full
                text-sm font-medium whitespace-nowrap
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-green-600 text-white border border-transparent shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50'
                }
              `}
              style={{
                // Tailwind未対応時のフォールバック
                ...(isActive
                  ? {
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      borderColor: 'transparent',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }
                  : {
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      borderColor: '#e5e7eb',
                    }),
              }}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* 右スクロール矢印 */}
      {showArrows && (
        <button
          onClick={() => handleScroll(1)}
          aria-label="右へスクロール"
          className="flex-shrink-0 flex items-center justify-center text-gray-500 active:bg-gray-100 transition-colors duration-200"
          style={{ width: '32px', height: '46px' }}
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
};

export default CategoryChips;
