import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DEFAULT_SORT = 'hot';

const useRedirectToDefaultSort = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);

    // If we're at the root or the path doesn't start with a sort type
    if (path === '/' || (parts.length > 0 && !['hot', 'new', 'active', 'topAll'].includes(parts[0]))) {
      const newPath = path === '/' ? `/${DEFAULT_SORT}` : `/${DEFAULT_SORT}${path}`;
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, navigate]);
};

export default useRedirectToDefaultSort;
