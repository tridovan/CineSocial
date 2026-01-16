import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Interface for the return value of useInfiniteScroll
 */
interface UseInfiniteScrollReturn<T> {
    data: T[];
    loading: boolean;
    error: any;
    hasMore: boolean;
    loadMore: () => void;
    lastElementRef: (node: HTMLElement | null) => void;
    reset: () => void;
    setData: React.Dispatch<React.SetStateAction<T[]>>;
}

/**
 * Interface for the generic pagination response
 */
interface PageResponse<T> {
    items: T[];
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElement: number;
}

/**
 * Generic Infinite Scroll Hook
 * 
 * @param fetchFn Function that returns a promise of PageResponse<T>
 * @param initialPage Initial page number (default 1)
 * @param pageSize Page size (default 10)
 * @param dependencies Dependencies that trigger a reset when changed
 */
export const useInfiniteScroll = <T>(
    fetchFn: (page: number, size: number) => Promise<PageResponse<T>>,
    initialPage = 1,
    pageSize = 10,
    dependencies: any[] = []
): UseInfiniteScrollReturn<T> => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);

    // Observer for the last element
    const observer = useRef<IntersectionObserver | null>(null);

    // Callback for the last element to trigger load more
    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (loading) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Cleanup function to reset state
    const reset = useCallback(() => {
        setData([]);
        setPage(initialPage);
        setHasMore(true);
        setError(null);
    }, [initialPage]);

    // Effect to handle dependencies changing (like feed type, user id)
    useEffect(() => {
        reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    // Effect to fetch data when page changes or after reset
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                // If fetching generic PageResponse based API.
                // We assume fetchFn handles the API call and returns { data: { ... } } structure 
                // OR we can adjust this hook to expect the full Axios response.
                // Based on User's request: { code: 1000, data: { items: [], ... } }
                // So fetchFn usually returns 'response.data' which is PageResponse<T>.

                const result = await fetchFn(page, pageSize);

                if (isMounted) {
                    if (result && result.items) {
                        setData(prev => {
                            // If page is 1, strictly replace. 
                            // Avoid duplicates or simple concatenation?
                            // Simple concat is fine if reset happened cleanly.
                            if (page === 1) return result.items;
                            return [...prev, ...result.items];
                        });
                        setHasMore(page < result.totalPage);
                    } else {
                        setHasMore(false);
                    }
                    setError(null);
                }
            } catch (err) {
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        // If page is 1 and data is empty, fetch. 
        // Or if page > 1, fetch.
        // Or if we just reset (data empty, page 1), fetch.
        // We added 'dependencies' effect which resets. Does that trigger this?
        // - Dependencies change -> reset() -> page=1, data=[]
        // - This effect runs because [page] likely includes page? Yes.
        // But reset is async state update? React batches.

        fetchData();

        return () => { isMounted = false; };
    }, [page, fetchFn, pageSize]);
    // fetchFn must be stable (useCallback) in parent!
    // But page changes will trigger it.

    return {
        data,
        loading,
        error,
        hasMore,
        loadMore: () => setPage(prev => prev + 1), // manual trigger if needed
        lastElementRef,
        reset,
        setData
    };
};
