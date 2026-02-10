/**
 * Updates the page title and meta description for SEO
 * @param {string} title - The page title
 * @param {string} description - The meta description
 */
export function setPageMeta(title, description) {
  // Update title
  document.title = title;

  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  } else {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = description;
    document.head.appendChild(metaDescription);
  }
}
