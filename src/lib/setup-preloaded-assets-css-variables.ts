export const setupPreloadedAssetsCssVariables = () => {
  // Get all preloaded image assets
  const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');

  preloadLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Convert the asset path to a variable name
    // e.g. "/assets/buttons/play-button.png" -> "--play-button"
    const name = href
      .split('/')
      .pop()! // Get filename
      .split('.')[0]; // Remove extension by taking everything before the dot

    // Set the CSS variable
    document.documentElement.style.setProperty(`--${name}`, `url("${href}")`);
  });
};
