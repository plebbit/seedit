import useWindowDimensionsStore from '../stores/use-window-dimensions-store';

const useWindowWidth = () => {
  const width = useWindowDimensionsStore((state) => state.width);
  return width;
};

export default useWindowWidth;
