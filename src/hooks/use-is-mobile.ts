import useWindowWidth from './use-window-width';

const useIsMobile = () => {
  const windowWidth = useWindowWidth();
  return windowWidth < 640;
};

export default useIsMobile;
