import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star, MapPin, Loader2, ShieldCheck } from 'lucide-react';
import { getAvailableProviders } from '../../shared/services/firestore';
import { fetchServiceCategories } from '../../shared/services/categories';

export default function Home() {
    const [searchParams] = useSearchParams();
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Keep the local search box in sync if someone lands here via the navbar's
    // global search (which navigates to /?search=...)
    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch !== null) setSearchQuery(urlSearch);
    }, [searchParams]);

    useEffect(() => {
        let isMounted = true;
        async function fetchProviders() {
            setLoading(true);
            setLoadError(null);
            try {
                const data = await getAvailableProviders();
                if (isMounted) setProviders(data);
            } catch (err) {
                console.error('Failed to load providers:', err);
                if (isMounted) setLoadError('Could not load providers right now. Please try again shortly.');
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchProviders();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;
        async function loadCategories() {
            setCategoriesLoading(true);
            try {
                const cats = await fetchServiceCategories();
                if (isMounted) setCategories(cats);
            } catch (err) {
                console.error('Failed to load categories:', err);
            } finally {
                if (isMounted) setCategoriesLoading(false);
            }
        }
        loadCategories();
        return () => { isMounted = false; };
    }, []);

    // Real category labels, fetched from Firestore above
    const allCategories = categories.map(c => c.label);

    const filteredCategories = allCategories.filter(c =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Display only the first 4 unless searching or 'Show All' is clicked
    const displayedCategories = (showAllCategories || searchQuery !== '')
        ? filteredCategories
        : filteredCategories.slice(0, 4);

    const handleCategoryClick = (cat) => {
        setSelectedCategory(prev => (prev === cat ? null : cat));
    };

    const visibleProviders = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return providers.filter(p => {
            const matchesCategory = !selectedCategory || (p.category || '').toLowerCase() === selectedCategory.toLowerCase();
            const matchesSearch = !q ||
                (p.name || '').toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [providers, selectedCategory, searchQuery]);

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-extrabold text-white mb-6">Find a Service</h1>

            {/* --- CATEGORY SECTION --- */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-4 gap-4">
                    <h2 className="text-xl font-bold text-white">Categories</h2>
                    <div className="relative w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Find me options (e.g., Haircuts)..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    </div>
                </div>

                {categoriesLoading && (
                    <p className="text-xs text-slate-500 mb-3">Loading categories...</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {displayedCategories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleCategoryClick(cat)}
                            className={`p-3 border rounded-xl shadow-sm transition-all text-sm font-semibold text-left ${
                                selectedCategory === cat
                                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500/60 hover:bg-slate-800'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {!showAllCategories && searchQuery === '' && filteredCategories.length > 4 && (
                    <button
                        onClick={() => setShowAllCategories(true)}
                        className="mt-4 text-amber-400 font-semibold hover:underline text-sm"
                    >
                        + See all {allCategories.length} categories
                    </button>
                )}

                {showAllCategories && searchQuery === '' && (
                    <button
                        onClick={() => setShowAllCategories(false)}
                        className="mt-4 text-amber-400 font-semibold hover:underline text-sm"
                    >
                        - Show less
                    </button>
                )}
            </div>

            {/* --- PROVIDERS SECTION --- */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Available Providers</h2>
                    {selectedCategory && (
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="text-xs font-semibold text-slate-400 hover:text-white"
                        >
                            Clear filter: {selectedCategory} ×
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="p-10 text-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-3">
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                        <p className="text-slate-400 text-sm">Loading available providers...</p>
                    </div>
                ) : loadError ? (
                    <div className="p-10 text-center bg-rose-500/5 border-2 border-dashed border-rose-500/30 rounded-2xl">
                        <p className="text-rose-400 font-medium text-sm">{loadError}</p>
                    </div>
                ) : visibleProviders.length === 0 ? (
                    <div className="p-10 text-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-2xl">
                        <p className="text-slate-300 font-medium">
                            {providers.length === 0
                                ? 'No providers are available right now.'
                                : 'No providers match your search or category.'}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {providers.length === 0
                                ? 'Real providers will automatically appear here once they mark themselves as available.'
                                : 'Try a different category or clearing your search.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {visibleProviders.map((p) => (
                            <Link
                                key={p.id}
                                to={`/customer/provider/${p.id}`}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500/60 transition-all shadow-sm"
                            >
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 font-black text-xl">
                                    {(p.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-white font-bold truncate">{p.name || `Provider #${p.id.substring(0, 6)}`}</h3>
                                        {p.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                    </div>
                                    <p className="text-xs text-slate-400 truncate">{p.category || 'General Service'}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                                        {typeof p.rating === 'number' && (
                                            <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                                <Star className="w-3 h-3 fill-amber-400" /> {p.rating.toFixed(1)}
                                            </span>
                                        )}
                                        {p.address && (
                                            <span className="flex items-center gap-1 text-slate-500 truncate">
                                                <MapPin className="w-3 h-3" /> {p.address}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {typeof p.price === 'number' && (
                                    <div className="text-right shrink-0">
                                        <p className="text-white font-bold">{p.price} ILS</p>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
