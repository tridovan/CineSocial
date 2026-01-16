import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { searchService } from '../services/searchService';
import type { PostDocument } from '../types';
import { PostItem } from '@/features/posts/components/PostItem';
import type { PostResponse } from '@/features/posts/types';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

export const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const filterType = searchParams.get('type') || undefined;

    const [keyword, setKeyword] = useState(query);
    const [resourceType, setResourceType] = useState<string | undefined>(filterType);
    const [results, setResults] = useState<PostDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debouncedKeyword = useDebounce(keyword, 300);
    const searchRef = useRef<HTMLDivElement>(null);

    // Initial search if query param exists
    useEffect(() => {
        if (query) {
            handleSearch(query, filterType);
        }
    }, []);

    // Handle Input Change (local state only) logic moved to render

    // Effect for Autocomplete
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedKeyword.trim()) {
                setSuggestions([]);
                return;
            }
            // Don't autocomplete if it matches the current query exactly (avoid redundancy if user hit enter)
            // But actually we want suggestions even then maybe? Let's keep it simple.

            try {
                const res = await searchService.autocomplete(debouncedKeyword);
                if (res.code === 1000 && res.data) {
                    setSuggestions(res.data);
                    // Only show if we have results and user is typing (implied by effect)
                    // We handle "show" state via focus/typing events, here we just set data
                }
            } catch (error) {
                console.error("Autocomplete error", error);
            }
        };

        fetchSuggestions();
    }, [debouncedKeyword]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleSearch = async (val: string = keyword, type: string | undefined = resourceType) => {
        setShowSuggestions(false); // Hide suggestions on search
        if (!val.trim()) {
            return;
        }

        try {
            setIsLoading(true);
            setHasSearched(true);

            // Update URL
            const params: any = { q: val };
            if (type) params.type = type;
            setSearchParams(params);

            const res = await searchService.searchPosts({
                keyword: val,
                resourceType: type as any,
                size: 20
            });
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
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex gap-2">
                    <div className="flex-1 relative" ref={searchRef}>
                        <input
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => {
                                if (keyword.trim()) setShowSuggestions(true);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search for posts..."
                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                        />
                        {keyword && (
                            <button
                                onClick={() => {
                                    setKeyword('');
                                    setResults([]);
                                    setHasSearched(false);
                                    setSearchParams({});
                                    setResourceType(undefined);
                                    setSuggestions([]);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                            >
                                Clear
                            </button>
                        )}

                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setKeyword(suggestion);
                                            handleSearch(suggestion);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-brand-red flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <Search size={16} className="text-gray-400" />
                                        <span className="font-medium truncate">{suggestion}</span>
                                    </button>
                                ))}
                            </div>
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

                {/* Filters */}
                <div className="flex gap-2">
                    {[
                        { label: 'All', value: undefined },
                        { label: 'Text', value: 'NONE' },
                        { label: 'Images', value: 'IMAGE' },
                        { label: 'Videos', value: 'VIDEO' }
                    ].map((type) => (
                        <button
                            key={type.label}
                            onClick={() => {
                                setResourceType(type.value);
                                if (keyword.trim()) {
                                    handleSearch(keyword, type.value);
                                }
                            }}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${resourceType === type.value
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
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
