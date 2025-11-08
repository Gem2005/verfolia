/**
 * AnimatedBackground Component
 * Provides the consistent animated background pattern used across all pages
 * Using color palette: Primary #2C3E50, Secondary #3498DB, Accent #E74C3C
 */
export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* Base gradient using primary colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ECF0F1] via-[#3498DB]/5 to-[#ECF0F1] dark:from-[#2C3E50] dark:via-[#34495E] dark:to-[#2C3E50] animate-shimmer" />
      
      {/* Radial gradients with secondary blue */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,152,219,0.12),transparent_50%)] animate-float" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(52,152,219,0.08),transparent_50%)] animate-float-delayed" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(231,76,60,0.06),transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Animated accent orbs with palette colors */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-[#3498DB]/12 to-[#2C3E50]/8 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-20 w-80 h-80 bg-gradient-to-br from-[#3498DB]/10 to-[#E74C3C]/6 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-gradient-to-br from-[#2C3E50]/8 to-[#3498DB]/6 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
    </div>
  );
};
