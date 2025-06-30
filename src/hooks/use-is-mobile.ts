import useWindowDimensionsStore from '../stores/use-window-dimensions-store';

const useIsMobile = () => {
  const isMobile = useWindowDimensionsStore((state) => state.isMobile);
  return isMobile;
};

export default useIsMobile;
