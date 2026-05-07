import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const getPaginationItems = () => {
    const items = [];
    const delta = 2; // Pages to show around current

    // Always include first and last
    // Include current, current - delta, current + delta
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        items.push(i);
      } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
        items.push('...');
      }
    }
    return items;
  };

  const pages = getPaginationItems();

  return (
    <nav className="flex justify-center items-center gap-2 mt-12 pb-20">
      {/* Previous */}
      {currentPage > 1 && (
        <Link 
          href={`/generics?page=${currentPage - 1}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          &lt;
        </Link>
      )}

      {/* Pages */}
      {pages.map((p, i) => (
        p === '...' ? (
          <span key={`dots-${i}`} className="text-gray-400 font-bold px-2">...</span>
        ) : (
          <Link 
            key={p} 
            href={`/generics?page=${p}`} 
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-colors 
              ${p === currentPage 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'}`}
          >
            {p}
          </Link>
        )
      ))}

      {/* Next */}
      {currentPage < totalPages && (
        <Link 
          href={`/generics?page=${currentPage + 1}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          &gt;
        </Link>
      )}
    </nav>
  );
}
