import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // ページ遷移時にスクロール位置を最上部にリセット
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
