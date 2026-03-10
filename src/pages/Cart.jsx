import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'https://komapay.p-kmt.com';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { fetchCartCount } = useAuth();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      // 一時的に認証なしでもカート取得可能にする
      const token = localStorage.getItem('authToken') || 'guest-token';
      /* 元のコード（ログイン必須にする場合は以下を有効化）
      if (!token) {
        setError('ログインしてください');
        setLoading(false);
        return;
      }
      */

      console.log('カート取得開始');
      console.log('トークン:', token ? `あり (長さ: ${token.length})` : 'なし');

      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('カートレスポンス:', response.status);
      console.log('レスポンスヘッダー:', response.headers.get('content-type'));

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('JSONでないレスポンス:', text.substring(0, 500));
        throw new Error('サーバーから正しい応答が得られませんでした');
      }

      const data = await response.json();
      console.log('カートデータ:', data);

      if (!response.ok) {
        throw new Error(data.message || 'カート情報の取得に失敗しました');
      }

      // APIレスポンスの構造: { success: true, data: { items: [...], total: 1000, count: 5 } }
      if (data.success && data.data && Array.isArray(data.data.items)) {
        console.log('カートアイテム数:', data.data.items.length);
        console.log('合計金額:', data.data.total);
        setCartItems(data.data.items);
      } else if (Array.isArray(data)) {
        console.log('カートアイテム数:', data.length);
        setCartItems(data);
      } else {
        console.warn('カートデータが期待する構造ではありません:', data);
        setCartItems([]);
      }
      
      // グローバルなカート数を更新
      await fetchCartCount();
    } catch (err) {
      console.error('Cart fetch error:', String(err));
      console.error('エラーメッセージ:', err.message || 'メッセージなし');
      setError(err.message || 'カート情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 0) return;

    try {
      // 数量が0の場合は削除（確認なし）
      if (newQuantity === 0) {
        await removeItem(itemId, false);
        return;
      }

      const token = localStorage.getItem('authToken') || 'guest-token';
      const response = await fetch(`${API_BASE_URL}/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '数量の更新に失敗しました');
      }

      // カートを再取得
      await fetchCart();
    } catch (err) {
      console.error('Update quantity error:', err);
      alert(err.message || '数量の更新に失敗しました');
    }
  };

  const removeItem = async (itemId, showConfirm = true) => {
    if (showConfirm && !confirm('この商品をカートから削除しますか？')) return;

    try {
      const token = localStorage.getItem('authToken') || 'guest-token';
      const response = await fetch(`${API_BASE_URL}/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '削除に失敗しました');
      }

      // カートを再取得
      await fetchCart();
    } catch (err) {
      console.error('Remove item error:', err);
      alert(err.message || '削除に失敗しました');
    }
  };

  const clearCart = async () => {
    if (!confirm('カートを空にしますか？')) return;

    try {
      const token = localStorage.getItem('authToken') || 'guest-token';
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'カートのクリアに失敗しました');
      }

      setCartItems([]);
      
      // グローバルなカート数を更新
      await fetchCartCount();
    } catch (err) {
      console.error('Clear cart error:', err);
      alert(err.message || 'カートのクリアに失敗しました');
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-24">
      {/* Main Content */}
      <main className="main-content min-h-screen pb-20 bg-gradient-to-b from-stone-50 to-white">
        <div className="container py-4 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="page-title text-2xl md:text-3xl font-bold text-stone-800 mb-2">🛒 ショッピングカート</h1>
            <p className="text-stone-600 text-sm md:text-base">商品を確認して購入手続きに進みます</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded-lg mb-4 animate-pulse">
              <p className="font-semibold">⚠️ エラー</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="text-center py-12 md:py-20">
              <div className="text-6xl md:text-7xl mb-4">📭</div>
              <p className="text-stone-600 mb-4 text-base md:text-lg font-semibold">カートに商品がありません</p>
              <p className="text-stone-500 mb-6 text-sm md:text-base">さっそく商品を探してみましょう</p>
              <Link to="/" className="inline-block bg-mos-green hover:bg-mos-green-dark text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">
                商品一覧を見る
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {/* Cart Items - 2/3 width on desktop */}
              <div className="md:col-span-2 space-y-3 md:space-y-4">
                {cartItems.map((item) => {
                  // APIレスポンスの構造に応じて商品情報を取得
                  const product = item.product || item;
                  const productName = product.name || 'Unknown Product';
                  const productPrice = product.price || 0;
                  const productImage = product.image_url || '';
                  const quantity = item.quantity || 1;

                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-stone-200">
                      <div className="flex flex-col md:flex-row gap-3 p-3 md:p-4">
                        {/* Product Image */}
                        <Link to={`/product/${product.id}`} className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-stone-100 to-stone-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                          {productImage ? (
                            <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-stone-400">No Image</span>
                          )}
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <Link to={`/product/${product.id}`} className="font-bold text-sm md:text-base text-stone-800 hover:text-mos-green transition-colors line-clamp-2">
                              {productName}
                            </Link>
                            <p className="text-stone-600 text-xs md:text-sm mt-1">¥{productPrice.toLocaleString()}</p>
                          </div>

                          {/* Quantity and Actions */}
                          <div className="flex items-center justify-between mt-2 md:mt-0">
                            <div className="flex items-center gap-1 bg-stone-50 rounded-lg p-1 md:p-1.5">
                              <button
                                onClick={() => updateQuantity(item.id, quantity - 1)}
                                className="w-6 h-6 md:w-8 md:h-8 rounded border border-mos-green text-mos-green flex items-center justify-center hover:bg-green-100 text-xs md:text-base font-semibold transition-all duration-200 active:scale-95"
                              >
                                −
                              </button>
                              <span className="w-6 md:w-8 text-center text-xs md:text-sm font-semibold">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, quantity + 1)}
                                className="w-6 h-6 md:w-8 md:h-8 rounded border border-mos-green text-mos-green flex items-center justify-center hover:bg-green-100 text-xs md:text-base font-semibold transition-all duration-200 active:scale-95"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg p-1.5 transition-colors"
                              aria-label="削除"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="flex flex-col items-end justify-between">
                          <div className="text-right">
                            <p className="text-xs text-stone-500 mb-1">小計</p>
                            <p className="font-bold text-lg md:text-xl text-mos-green">
                              ¥{(productPrice * quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary - 1/3 width on desktop, sticky on desktop */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-br from-white to-stone-50 rounded-xl shadow-lg p-5 md:p-6 md:sticky md:top-24 border border-stone-200">
                  <h2 className="font-bold text-lg md:text-xl mb-4 text-stone-800">注文サマリー</h2>
                  
                  <div className="space-y-3 mb-4 pb-4 border-b border-stone-200">
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-stone-600">小計</span>
                      <span className="font-semibold">¥{getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-stone-600">配送料</span>
                      <span className="font-semibold text-green-600">無料</span>
                    </div>
                  </div>

                  <div className="text-center mb-6 py-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-stone-600 mb-1">合計</div>
                    <div className="text-3xl font-black text-mos-green">
                      ¥{getTotalPrice().toLocaleString()}
                    </div>
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-mos-green to-mos-green-dark hover:shadow-lg hover:scale-105 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 text-base md:text-lg flex items-center justify-center gap-2 shadow-md active:scale-95"
                    onClick={() => alert('購入機能はまだ実装されていません')}
                  >
                    <span>🛒</span>
                    <span>購入手続きへ</span>
                  </button>

                  <button
                    onClick={() => { /* navigate to products */ window.location.href = '/'; }}
                    className="w-full mt-3 bg-white border-2 border-mos-green text-mos-green hover:bg-green-50 font-bold py-3 px-4 rounded-lg transition-all duration-200 text-base md:text-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>🛍️</span>
                    <span>買い物を続ける</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;
