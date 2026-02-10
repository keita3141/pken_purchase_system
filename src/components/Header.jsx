import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { cartCount, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-14 bg-[#333333] shadow-lg z-50 flex items-center justify-between px-4 md:px-6">
        {/* 左側：ロゴとナビゲーション */}
        <div className="flex items-center gap-6">
          {/* モバイルメニューボタン */}
          <button
            className="md:hidden text-white text-2xl focus:outline-none hover:text-gray-300"
            aria-label="メニューを開く"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-icons">menu</span>
          </button>
          
          {/* ロゴ */}
          <Link to="/" className="text-white font-bold text-lg md:text-xl hover:text-gray-300 transition-colors flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <span className="hidden sm:inline">Mobile Order</span>
          </Link>
          
          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center">
            <Link 
              to="/" 
              className="px-4 py-2 text-white hover:bg-[#444444] transition-colors text-sm font-medium relative group"
            >
              商品一覧
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/cart" 
              className="px-4 py-2 text-white hover:bg-[#444444] transition-colors text-sm font-medium relative group"
            >
              カート
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/purchase-history" 
              className="px-4 py-2 text-white hover:bg-[#444444] transition-colors text-sm font-medium relative group"
            >
              購入履歴
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>
        </div>
        
        {/* 右側：アイコン群、言語切り替え、ユーザーメニュー */}
        <div className="flex items-center gap-3">
          {/* カート通知アイコン */}
          <Link 
            to="/cart" 
            className="relative p-2 text-white hover:bg-[#444444] rounded transition-colors"
            aria-label="カート"
          >
            <span className="material-icons text-2xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* 通知アイコン */}
          <button 
            className="hidden md:block p-2 text-white hover:bg-[#444444] rounded transition-colors"
            aria-label="通知"
          >
            <span className="material-icons text-2xl">notifications</span>
          </button>

          {/* 設定アイコン */}
          <button 
            className="hidden md:block p-2 text-white hover:bg-[#444444] rounded transition-colors"
            aria-label="設定"
          >
            <span className="material-icons text-2xl">settings</span>
          </button>

          {/* 言語切り替え */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="px-3 py-1.5 text-white hover:bg-[#444444] rounded transition-colors text-sm flex items-center gap-1"
            >
              <span className="material-icons text-lg">language</span>
              <span>日本語</span>
              <span className="material-icons text-sm">{isLangMenuOpen ? 'expand_less' : 'expand_more'}</span>
            </button>
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                  日本語
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                  English
                </button>
              </div>
            )}
          </div>

          {/* ユーザーメニュー */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-white hover:bg-[#444444] rounded transition-colors"
              >
                <span className="material-icons text-2xl">account_circle</span>
                <span className="hidden md:inline text-sm font-medium">{user.name || user.student_id}</span>
                <span className="hidden md:inline material-icons text-sm">{isUserMenuOpen ? 'expand_less' : 'expand_more'}</span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-bold text-gray-800">{user.name || '名前未設定'}</p>
                    <p className="text-xs text-gray-500">{user.student_id}</p>
                  </div>
                  <Link
                    to="/purchase-history"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span className="material-icons text-lg">history</span>
                    購入履歴
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <span className="material-icons text-lg">logout</span>
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <span className="material-icons text-lg">login</span>
              <span>ログイン</span>
            </Link>
          )}
        </div>
      </header>

      {/* モバイルドロワーメニュー */}
      {isMenuOpen && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* メニューパネル */}
          <div className="fixed top-0 left-0 w-64 h-full bg-[#333333] shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-r border-gray-700">
            <div className="p-4 border-b border-gray-700 bg-[#2a2a2a]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">メニュー</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white text-2xl focus:outline-none hover:bg-[#444444] rounded p-1"
                  aria-label="メニューを閉じる"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
              
              {/* ユーザー情報表示 */}
              {user && (
                <div className="bg-[#444444] rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-icons text-gray-300">account_circle</span>
                    <span className="font-bold text-white">{user.name || '名前未設定'}</span>
                  </div>
                  <p className="text-xs text-gray-400 ml-8">学生番号: {user.student_id || '-'}</p>
                </div>
              )}
            </div>
            
            <nav className="flex-1 flex flex-col p-4 overflow-y-auto">
              <div className="space-y-1">
                <Link 
                  to="/" 
                  className="px-4 py-3 hover:bg-[#444444] text-white rounded transition-colors flex items-center gap-3 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="material-icons text-lg">store</span>
                  <span>商品一覧</span>
                </Link>
                <Link 
                  to="/cart" 
                  className="px-4 py-3 hover:bg-[#444444] text-white rounded transition-colors flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="material-icons text-lg">shopping_cart</span>
                  <span>カート</span>
                  {cartCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/purchase-history" 
                  className="px-4 py-3 hover:bg-[#444444] text-white rounded transition-colors flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="material-icons text-lg">history</span>
                  <span>購入履歴</span>
                </Link>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-700 space-y-2">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-3"
                  >
                    <span className="material-icons text-lg">logout</span>
                    <span>ログアウト</span>
                  </button>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-3 justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="material-icons text-lg">login</span>
                      <span>ログイン</span>
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-4 py-3 hover:bg-[#444444] text-white rounded transition-colors flex items-center gap-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="material-icons text-lg">person_add</span>
                      <span>新規登録</span>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
