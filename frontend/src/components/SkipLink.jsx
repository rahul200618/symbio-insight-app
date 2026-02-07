/**
 * SkipLink Component
 * 
 * Provides a "Skip to main content" link for keyboard users and screen readers.
 * This improves accessibility by allowing users to bypass repetitive navigation.
 */

export function SkipLink({ targetId = 'main-content', children = 'Skip to main content' }) {
  const handleClick = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 focus:w-auto focus:h-auto focus:p-0 focus:m-0 focus:overflow-visible focus:whitespace-normal focus:z-[9999] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-all"
      style={{ clip: 'rect(0, 0, 0, 0)' }}
      onFocus={(e) => e.target.style.clip = 'auto'}
      onBlur={(e) => e.target.style.clip = 'rect(0, 0, 0, 0)'}
    >
      {children}
    </a>
  );
}

export default SkipLink;
