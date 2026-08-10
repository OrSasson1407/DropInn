import React, { useState } from 'react';

export default function Home() {
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // You can expand this array or map it to a database call later
    const allCategories = [
        'Haircuts & Beard', 'Manicure & Pedicure', 'Massage Therapy',
        'House Cleaning', 'Plumbing', 'Electrician', 'Personal Training',
        'Dog Walking', 'Photography', 'Moving Services', 'Makeup Artist'
    ];

    const filteredCategories = allCategories.filter(c =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Display only the first 4 unless searching or 'Show All' is clicked
    const displayedCategories = (showAllCategories || searchQuery !== '')
        ? filteredCategories
        : filteredCategories.slice(0, 4);

    // Completely clean slate for real providers
    const providers = [];

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto font-sans text-gray-800">
            <h1 className="text-3xl font-bold mb-6">Find a Service</h1>

            {/* --- CATEGORY SECTION --- */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-4 gap-4">
                    <h2 className="text-xl font-semibold">Categories</h2>
                    <input
                        type="text"
                        placeholder="Find me options (e.g., Haircuts)..."
                        className="border border-gray-300 p-2 rounded-lg shadow-sm w-full md:w-1/3"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {displayedCategories.map((cat, idx) => (
                        <button
                            key={idx}
                            className="p-3 border border-gray-200 rounded-xl shadow-sm hover:bg-blue-50 hover:border-blue-400 transition-all text-sm font-medium text-left"
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {!showAllCategories && searchQuery === '' && filteredCategories.length > 4 && (
                    <button
                        onClick={() => setShowAllCategories(true)}
                        className="mt-4 text-blue-600 font-medium hover:underline text-sm"
                    >
                        + See all {allCategories.length} categories
                    </button>
                )}

                {showAllCategories && searchQuery === '' && (
                    <button
                        onClick={() => setShowAllCategories(false)}
                        className="mt-4 text-blue-600 font-medium hover:underline text-sm"
                    >
                        - Show less
                    </button>
                )}
            </div>

            {/* --- PROVIDERS SECTION --- */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Available Providers</h2>
                {providers.length === 0 ? (
                    <div className="p-10 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-gray-500 font-medium">The provider list is completely clean.</p>
                        <p className="text-sm text-gray-400 mt-1">Real providers will automatically appear here once added to the categories.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {/* Map through real providers here in the future */}
                    </div>
                )}
            </div>
        </div>
    );
}
