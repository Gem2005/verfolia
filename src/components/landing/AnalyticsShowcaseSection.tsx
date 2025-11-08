"use client";

import {
  Eye,
  TrendingUp,
  Activity,
  MapPin,
  Users,
  Clock,
  BarChart2,
  Globe,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Card } from "@/components/ui/card";

export const AnalyticsShowcaseSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      {/* Animated background orb */}
      <div className="absolute -bottom-20 -left-20 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-500/8 to-cyan-500/8 rounded-full blur-3xl animate-float-delayed opacity-60 hover:opacity-100 transition-opacity duration-700" />
      
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${isVisible ? 'scroll-reveal visible' : 'scroll-reveal'}`}>
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
          <div className="order-1 lg:order-2 space-y-5 sm:space-y-6 md:space-y-8 animate-slide-in-right">
            <div>
              <h2 className="font-extrabold mb-3 sm:mb-4 md:mb-6 text-balance leading-tight" style={{ fontSize: 'clamp(1.75rem, 4vw + 0.5rem, 3.5rem)' }}>
                Know you&apos;ve been{" "}
                <span className="gradient-text-enhanced">seen</span>, every single time.
              </h2>
              <p className="text-muted-foreground leading-relaxed" style={{ fontSize: 'clamp(0.9375rem, 1.2vw + 0.25rem, 1.125rem)' }}>
                Verfolia ends the guesswork. Our real-time analytics turn your
                profile into a data-powered asset, giving you the clarity and
                confidence to know that your professional story is getting
                noticed.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {[
                { text: "Live engagement tracking", icon: Activity },
                { text: "Geographic analytics", icon: MapPin },
                { text: "Time-based engagement data", icon: TrendingUp },
                { text: "Behavioral heatmaps", icon: Eye },
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2.5 sm:space-x-3 md:space-x-4 group">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                    <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" />
                  </div>
                  <span className="text-foreground font-semibold group-hover:text-blue-500 transition-colors duration-300" style={{ fontSize: 'clamp(0.8125rem, 1vw + 0.25rem, 1rem)' }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-2 lg:order-1 animate-slide-in-left">
            <div className="relative group">
              {/* Main Analytics Card - Preview Container Style */}
              <div className="glass-card-strong rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-blue-500/20 group-hover:border-blue-500/40 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] hover-tilt hover-lift overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-br from-[#ECF0F1]/30 to-white/30 dark:from-[#2C3E50]/30 dark:to-[#34495E]/30 border-b-2 border-blue-500/10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#E74C3C] shadow-sm"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F39C12] shadow-sm"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27AE60] shadow-sm"></div>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#2C3E50] dark:text-[#ECF0F1] ml-1 sm:ml-2">
                      Analytics Dashboard
                    </h3>
                  </div>
                </div>
                
                {/* Preview Content */}
                <div className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-purple-500/10 p-3 sm:p-4 md:p-6">
                  <div className="aspect-[4/3] bg-white dark:bg-[#1a1a1a] rounded-xl border border-blue-500/10 relative overflow-auto">
                    {/* Analytics Dashboard Content - Scaled down version */}
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      {/* Overview Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <Card className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900 border-blue-200/50 dark:border-blue-800/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[0.6rem] sm:text-xs text-muted-foreground font-medium">Total Views</p>
                              <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">1,234</p>
                              <p className="text-[0.55rem] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">+12.5% this week</p>
                            </div>
                            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        </Card>

                        <Card className="p-2 sm:p-3 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900 border-emerald-200/50 dark:border-emerald-800/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[0.6rem] sm:text-xs text-muted-foreground font-medium">Unique Visitors</p>
                              <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">892</p>
                              <p className="text-[0.55rem] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">+8.3% this week</p>
                            </div>
                            <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          </div>
                        </Card>

                        <Card className="p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 border-purple-200/50 dark:border-purple-800/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[0.6rem] sm:text-xs text-muted-foreground font-medium">Avg. Duration</p>
                              <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">2m 45s</p>
                              <p className="text-[0.55rem] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">+15.2% this week</p>
                            </div>
                            <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                        </Card>

                        <Card className="p-2 sm:p-3 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-900 border-amber-200/50 dark:border-amber-800/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[0.6rem] sm:text-xs text-muted-foreground font-medium">Engagement</p>
                              <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">85%</p>
                              <p className="text-[0.55rem] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">+5.7% this week</p>
                            </div>
                            <div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Chart Section */}
                      <Card className="p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Views Over Time</h3>
                            <p className="text-[0.6rem] sm:text-xs text-muted-foreground">Last 7 days</p>
                          </div>
                          <BarChart2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                        </div>
                        
                        {/* Mini Bar Chart */}
                        <div className="h-16 sm:h-20 flex items-end justify-around gap-1">
                          {[
                            { height: 40, value: 45, label: 'Mon' },
                            { height: 65, value: 78, label: 'Tue' },
                            { height: 45, value: 52, label: 'Wed' },
                            { height: 80, value: 95, label: 'Thu' },
                            { height: 55, value: 68, label: 'Fri' },
                            { height: 70, value: 82, label: 'Sat' },
                            { height: 90, value: 110, label: 'Sun' }
                          ].map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                              <div className="relative w-full">
                                <div 
                                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t backdrop-blur-sm transition-all group-hover/bar:from-blue-600 group-hover/bar:to-blue-500"
                                  style={{ height: `${day.height * 0.6}px` }}
                                />
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                  <div className="text-[0.55rem] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap bg-white dark:bg-gray-800 px-1 py-0.5 rounded shadow-sm">
                                    {day.value}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[0.5rem] sm:text-[0.6rem] text-muted-foreground">{day.label}</span>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Location & Device Grid */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Card className="p-2 sm:p-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                            <h4 className="text-[0.65rem] sm:text-xs font-semibold">Top Locations</h4>
                          </div>
                          <div className="space-y-1 sm:space-y-1.5">
                            {[
                              { country: "United States", count: 234, percent: 45 },
                              { country: "United Kingdom", count: 128, percent: 25 },
                              { country: "Canada", count: 89, percent: 17 },
                            ].map((loc, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-[0.6rem] sm:text-xs text-muted-foreground">{loc.country}</span>
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                  <div className="w-8 sm:w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${loc.percent}%` }} />
                                  </div>
                                  <span className="text-[0.55rem] sm:text-xs font-medium text-foreground min-w-[1.5rem] text-right">{loc.count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>

                        <Card className="p-2 sm:p-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                            <h4 className="text-[0.65rem] sm:text-xs font-semibold">Top Interactions</h4>
                          </div>
                          <div className="space-y-1 sm:space-y-1.5">
                            {[
                              { action: "Email Click", count: 45 },
                              { action: "LinkedIn Visit", count: 38 },
                              { action: "GitHub Visit", count: 29 },
                            ].map((int, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-[0.6rem] sm:text-xs text-muted-foreground">{int.action}</span>
                                <span className="text-[0.6rem] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">{int.count}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 glass-card p-2.5 sm:p-3 md:p-5 rounded-2xl backdrop-blur-xl shadow-xl border-2 border-blue-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                <div className="text-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-2xl sm:text-3xl font-bold gradient-text-enhanced">1.2k</div>
                  <div className="text-xs text-muted-foreground font-medium">Views</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 glass-card p-3 sm:p-5 rounded-2xl backdrop-blur-xl shadow-xl border-2 border-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <div className="text-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto mb-1" />
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-500">85%</div>
                  <div className="text-xs text-muted-foreground font-medium">Engagement</div>
                </div>
              </div>

              {/* Additional floating badge */}
              <div className="absolute top-1/2 -left-3 sm:-left-4 glass-card p-2 sm:p-3 rounded-xl backdrop-blur-xl shadow-lg border border-purple-500/30 group-hover:scale-110 transition-all duration-500">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
