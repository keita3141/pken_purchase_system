import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpDown, Star } from 'lucide-react'; // アイコンをインポート

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('popularity');

  // データ取得と整形ロジック (既存のuseEffectを再利用・改善)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/products`, { headers });

        if (!response.ok) {
          throw new Error('商品データの取得に失敗しました');
        }

        const data = await response.json();
        let productsData = [];

        if (data.success && Array.isArray(data.data)) {
          productsData = data.data;
        } else if (Array.isArray(data)) {
          productsData = data;
        } else {
          console.error('❌ Unexpected API response format:', data);
          throw new Error('予期しないデータ形式です。');
        }
        
        const validProducts = productsData
          .filter(item => item.id && item.name && !item.username && !item.student_id)
          .map(item => ({
            ...item,
            // ダミーの販売数と評価を追加
            sales: item.sales || Math.floor(Math.random() * 200),
            rating: item.rating || (Math.random() * 2 + 3).toFixed(1), // 3.0〜5.0のランダムな評価
            category_name: item.category_name?.trim() || '',
            vendor_name: item.vendor_name?.trim() || '',
            label: item.label?.trim() || '',
          }));

        setProducts(validProducts);
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 検索とソートを適用した商品リスト
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        switch (sortType) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'popularity':
          default:
            return b.sales - a.sales;
        }
      });
  }, [products, searchTerm, sortType]);

  // ソートオプション
  const sortOptions = [
    { key: 'popularity', label: '売れ筋' },
    { key: 'price_asc', label: '価格の安い順' },
    { key: 'price_desc', label: '価格の高い順' },
    { key: 'rating', label: '評価の高い順' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 pt-20 pb-8">
        
        {/* 検索バー */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="商品を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
          />
        </div>

        {/* 並び替えチップ */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-600 mb-2 flex items-center">
            <ArrowUpDown size={16} className="mr-1.5" />
            並び替え
          </p>
          <div className="flex overflow-x-auto space-x-2 pb-2 -mx-4 px-4">
            {sortOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setSortType(option.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out shadow-sm border
                  ${sortType === option.key 
                    ? 'bg-green-600 text-white border-transparent' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                  }`}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 商品グリッド */}
        <div className="grid grid-cols-2 gap-4">
          {filteredAndSortedProducts.map(product => (
            <Link to={`/products/${product.id}`} key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 group">
              <div className="relative">
                <img 
                  src={product.image_url || 'https://placehold.jp/300x300.png?text=No+Image'} 
                  alt={product.name} 
                  className="w-full h-40 object-cover"
                />
                {product.label && (
                  <span className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                    {product.label}
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm text-gray-800 truncate-2-lines h-10">
                  {product.name}
                </h3>
                <p className="text-lg font-extrabold text-accent mt-1">
                  ¥{Number(product.price).toLocaleString()}
                  <span className="text-xs text-gray-500 font-normal ml-1">（税込）</span>
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  <p className="truncate">{product.vendor_name}</p>
                  <div className="flex items-center mt-1">
                    <Star size={14} className="text-yellow-400 mr-0.5" />
                    <span>{product.rating}</span>
                    <span className="ml-1.5">({product.sales}+)</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;

// CSS in JS for multi-line truncate (can be moved to index.css)
const style = document.createElement('style');
style.innerHTML = `
  .truncate-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
document.head.appendChild(style);

    const fetchNews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/news`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            // 最新3件のニュースのみ取得
            setNewsList(data.data.slice(0, 3));
          } else if (Array.isArray(data)) {
            setNewsList(data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('News fetch error:', err);
      }
    };

    fetchProducts();
    fetchNews();
  }, []);

  // Filter and Sort
  const getFilteredAndSortedProducts = () => {
    // Ensure all products are valid before filtering
    const validProducts = products.filter(product => 
      product && product.id && product.name && !product.username
    );
    
    let filtered = validProducts.filter(product => {
      const name = product.name && typeof product.name === 'string' ? product.name : '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) => {
      try {
        if (sortType === 'price_asc') return (a.price || 0) - (b.price || 0);
        if (sortType === 'price_desc') return (b.price || 0) - (a.price || 0);
        if (sortType === 'name') {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB);
        }
        // default: popularity
        return (b.popularity || 0) - (a.popularity || 0);
      } catch (err) {
        console.error('Sort error:', err);
        return 0;
      }
    });
  };

  const displayedProducts = getFilteredAndSortedProducts();

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-6">
      {/* Main Content */}
      <main className="main-content min-h-screen pb-20">
        <div className="container">

          {/* Search & Sort Area with left sidebar buttons */}
          <div className="flex gap-6">
            <aside className="w-40">
              <div className="sticky top-20 bg-white p-3 rounded-md shadow-sm z-10">
                <h4 className="text-sm font-semibold mb-3 text-stone-800">並び替え</h4>
                <div className="flex flex-col space-y-2">
                  <button
                    className={`px-3 py-2 rounded-lg text-sm text-left font-semibold transition-all duration-200 active:scale-95 ${sortType === 'popularity' ? 'bg-mos-green text-white shadow-md' : 'bg-white text-stone-700 border border-stone-300 hover:border-mos-green hover:bg-green-50'}`}
                    onClick={() => setSortType('popularity')}
                  >
                    売れ筋順
                  </button>

                  <button
                    className={`px-3 py-2 rounded-lg text-sm text-left font-semibold transition-all duration-200 active:scale-95 ${sortType === 'price_asc' ? 'bg-mos-green text-white shadow-md' : 'bg-white text-stone-700 border border-stone-300 hover:border-mos-green hover:bg-green-50'}`}
                    onClick={() => setSortType('price_asc')}
                  >
                    価格が安い順
                  </button>

                  <button
                    className={`px-3 py-2 rounded-lg text-sm text-left font-semibold transition-all duration-200 active:scale-95 ${sortType === 'price_desc' ? 'bg-mos-green text-white shadow-md' : 'bg-white text-stone-700 border border-stone-300 hover:border-mos-green hover:bg-green-50'}`}
                    onClick={() => setSortType('price_desc')}
                  >
                    価格が高い順
                  </button>

                  <button
                    className={`px-3 py-2 rounded-lg text-sm text-left font-semibold transition-all duration-200 active:scale-95 ${sortType === 'name' ? 'bg-mos-green text-white shadow-md' : 'bg-white text-stone-700 border border-stone-300 hover:border-mos-green hover:bg-green-50'}`}
                    onClick={() => setSortType('name')}
                  >
                    名前順
                  </button>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="search-wrapper mb-4">
                <input 
                  type="text" 
                  placeholder="商品を検索..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>

              <div className="product-grid">
                {displayedProducts.length > 0 ? (
                  displayedProducts.map(product => (
                    <Link 
                      to={`/product/${product.id}`} 
                      key={product.id} 
                      className="block bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 group"
                    >
                      <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 relative flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <span className="text-stone-400 text-sm">No Image</span>
                        )}
                      </div>
                      <div className="p-4">
                        {product.label && (
                          <div className="mb-2 flex justify-end">
                            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                              {product.label}
                            </span>
                          </div>
                        )}
                        <h3 className="text-base md:text-lg font-bold text-stone-800 mb-2 leading-snug break-words">{product.name}</h3>

                        {((product.category_name && product.category_name !== '未入力') || (product.vendor_name && product.vendor_name !== '未入力')) && (
                          <div className="flex flex-wrap gap-2 text-xs text-stone-500 mb-2">
                            {product.vendor_name && product.vendor_name !== '未入力' && (
                              <span className="px-2 py-1 bg-stone-100 rounded-full">
                                販売者 {product.vendor_name}
                              </span>
                            )}
                            {product.category_name && product.category_name !== '未入力' && (
                              <span className="px-2 py-1 bg-stone-100 rounded-full">
                                カテゴリ {product.category_name}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl md:text-3xl font-black text-mos-green">¥{product.price ? product.price.toLocaleString() : '-'}</span>
                          <span className="text-xs text-stone-500">税込</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="no-results col-span-full">
                    該当する商品が見つかりませんでした。
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* News Section */}
          {newsList.length > 0 && (
            <div className="mt-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800">最新ニュース</h2>
                <Link to="/news" className="text-mos-green hover:text-mos-green-dark font-semibold text-sm">
                  すべて見る →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {newsList.map((newsItem) => (
                  <div key={newsItem.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-300">
                    <div className="text-sm text-stone-500 mb-2">
                      {new Date(newsItem.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </div>
                    <h3 className="text-base font-bold text-stone-800 mb-2 line-clamp-2">
                      {newsItem.title}
                    </h3>
                    <p className="text-stone-600 text-sm line-clamp-2">
                      {newsItem.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ProductList;
