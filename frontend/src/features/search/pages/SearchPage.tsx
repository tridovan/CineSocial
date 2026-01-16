import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { searchService } from '../services/searchService';
import type { PostDocument } from '../types';
import { PostItem } from '@/features/posts/components/PostItem';
import type { PostResponse } from '@/features/posts/types';
import toast from 'react-hot-toast';

export const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [keyword, setKeyword] = useState(query);
    const [results, setResults] = useState<PostDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Initial search if query param exists
    useEffect(() => {
        if (query) {
            handleSearch(query);
        }
    }, []);

    const handleSearch = async (val: string = keyword) => {
        if (!val.trim()) {
            return;
        }

        try {
            setIsLoading(true);
            setHasSearched(true);

            // Update URL
            setSearchParams({ q: val });

            const res = await searchService.searchPosts({ keyword: val, size: 20 });
            if (res.code === 1000 && res.data) {
                setResults(res.data.items);
            }
        } catch (error) {
            console.error("Search failed", error);
            toast.error("Search failed");
        } finally {
            setIsLoading(false);
        }
    };

    // Adapter to convert PostDocument to PostResponse for UI reuse
    const adaptToPost = (doc: PostDocument): PostResponse => {
        // Split author name logic if possible, or just use full name in first name
        const names = doc.authorName ? doc.authorName.split(' ') : ['User'];
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || '';

        return {
            id: doc.id,
            title: doc.title,
            content: doc.content,
            resourceUrl: doc.resourceUrl,
            resourceType: doc.resourceType as any, // Cast to ResourceType
            voteCount: doc.voteCount,
            commentCount: doc.commentCount,
            createdAt: doc.createdAt,
            updatedAt: doc.createdAt,
            userVoteValue: 0, // Search results likely don't have user specific vote context unless added to index
            status: 'COMPLETED',
            userProfile: {
                id: doc.authorId,
                firstName: firstName,
                lastName: lastName,
                imgUrl: doc.authorAvatar,
                // Missing fields filled with defaults or optional
            }
        };
    };

    return (
        <div className="max-w-2xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Search Posts</h1>

            {/* Search Bar */}
            <div className="flex gap-2 mb-8">
                <div className="flex-1 relative">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search for posts..."
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                    />
                    {keyword && (
                        <button
                            onClick={() => { setKeyword(''); setResults([]); setHasSearched(false); setSearchParams({}); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <button
                    onClick={() => handleSearch()}
                    disabled={isLoading || !keyword.trim()}
                    className="bg-brand-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                    Search
                </button>
            </div>

            {/* Results */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="text-center py-10">
                        <Loader2 className="animate-spin mx-auto text-brand-yellow mb-2" size={32} />
                        <p className="text-gray-500">Searching...</p>
                    </div>
                ) : results.length > 0 ? (
                    results.map(doc => (
                        <PostItem
                            key={doc.id}
                            post={adaptToPost(doc)}
                            onUpdate={() => { }} // Optional: might need logic if interaction updates state
                        />
                    ))
                ) : hasSearched ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No results found for "{query}".</p>
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <Search size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-400">Enter keywords to search</p>
                    </div>
                )}
            </div>
        </div>
    );
};
