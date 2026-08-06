import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { INITIAL_STYLE_FEED } from '../../shared/services/v2Data';
import { Sparkles, Heart, Scissors, Filter, ArrowRight, Eye, CheckCircle2, Bookmark } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

export default function StyleInspirationFeed() {
  const [feed, setFeed] = useState(INITIAL_STYLE_FEED);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedIds, setLikedIds] = useState({});
  const [savedIds, setSavedIds] = useState({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const isLiked = !!prev[id];
      const newLiked = { ...prev, [id]: !isLiked };
      
      setFeed((fList) =>
        fList.map((item) => {
          if (item.id === id) {
            return { ...item, likes: item.likes + (isLiked ? -1 : 1) };
          }
          return item;
        })
      );
      
      if (!isLiked) toast.success('Saved look to your liked style inspiration!', 'Style Liked');
      return newLiked;
    });
  };

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const isSaved = !prev[id];
      if (isSaved) toast.success('Bookmarked look in your saved style lookbook.', 'Look Bookmarked');
      return { ...prev, [id]: isSaved };
    });
  };

  const categories = [
    { id: 'all', label: 'All Styles' },
    { id: 'Men\'s Haircut', label: 'Men\'s Haircuts' },
    { id: 'Women\'s Styling', label: 'Blowouts & Hair' },
    { id: 'Nail Care', label: 'Nail Art' },
    { id: 'Makeup & Glam', label: 'Makeup & Glam' }
  ];

  const filteredFeed = feed.filter((item) =>
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DropIn Lookbook v2.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Style Inspiration Feed
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Browse real trending transformations from top local mobile specialists. Click <strong className="text-amber-400">"Book This Look"</strong> to instantly match with specialists who deliver this exact haircut or treatment to your door.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Styles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeed.map((item) => {
          const isLiked = !!likedIds[item.id];
          const isSaved = !!savedIds[item.id];

          return (
            <div
              key={item.id}
              className="group bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-wider">
                    {item.category}
                  </div>

                  {/* Save/Like Quick Controls */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => toggleLike(item.id)}
                      className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                        isLiked
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                      title="Like look"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleSave(item.id)}
                      className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                        isSaved
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                      title="Bookmark look"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-950' : ''}`} />
                    </button>
                  </div>

                  {/* Likes Count Overlay */}
                  <div className="absolute bottom-3 left-3 text-xs text-white font-bold flex items-center gap-1.5 drop-shadow">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{item.likes} likes</span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Created by <strong className="text-slate-200">{item.author}</strong>
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Price + Action */}
              <div className="p-5 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg. Price</span>
                  <span className="text-amber-400 font-black text-sm">{item.price} ILS</span>
                </div>

                <Link
                  to={`/customer/book/demo_provider_1?look=${encodeURIComponent(item.title)}`}
                  className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                >
                  <span>Book This Look</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
