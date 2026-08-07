import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Compass } from 'lucide-react';

export default function PageHeaderBar({
  title,
  subtitle,
  category,
  breadcrumbs = [],
  stepCurrent,
  stepTotal,
  stepTitle,
  onBack,
  actionButton
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 backdrop-blur py-3 px-4 sm:px-6 mb-6 rounded-2xl shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Back button + Breadcrumbs + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all shrink-0"
            title="Go back"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>

          <div className="space-y-0.5 min-w-0">
            {/* Breadcrumb row */}
            {breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Link to="/" className="hover:text-amber-400 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span>Home</span>
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 rtl:rotate-180" />
                    {crumb.path ? (
                      <Link to={crumb.path} className="hover:text-amber-400 truncate max-w-[120px]">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-slate-200 font-semibold truncate max-w-[150px]">
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Title & Subtitle */}
            {title && (
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                  {title}
                </h1>
                {category && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                    {category}
                  </span>
                )}
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 truncate max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Step Progress or Custom Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {stepCurrent && stepTotal && (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider font-mono text-amber-400 font-bold">
                  Step {stepCurrent} of {stepTotal}
                </div>
                {stepTitle && (
                  <div className="text-xs font-bold text-white max-w-[140px] truncate">
                    {stepTitle}
                  </div>
                )}
              </div>
              <div className="w-10 h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${(stepCurrent / stepTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

          {actionButton}
        </div>
      </div>
    </div>
  );
}
