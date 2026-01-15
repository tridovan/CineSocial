import { Search } from 'lucide-react';

export const SearchInput = () => {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                placeholder="Search movies, people..."
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-gold placeholder-gray-500"
            />
        </div>
    );
};
