export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'title',
    name: 'Title Slide',
    description: 'A high-impact title slide with a modern dark gradient background.',
    code: `
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
<style>
    .slide-container {
        width: 1280px;
        height: 720px;
        position: relative;
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Inter', sans-serif;
        padding: 64px;
        color: white;
    }
    .accent-ring {
        position: absolute;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
        top: -200px;
        right: -200px;
        pointer-events: none;
    }
    .accent-ring-2 {
        position: absolute;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0) 70%);
        bottom: -150px;
        left: -150px;
        pointer-events: none;
    }
</style>

<div class="slide-container">
    <div class="accent-ring"></div>
    <div class="accent-ring-2"></div>
    
    <div class="text-center max-w-4xl z-10">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold tracking-wider uppercase mb-6 font-mono">
            <i class="fa-solid fa-sparkles"></i> Strategic Keynote
        </div>
        <h1 class="text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200 leading-tight">
            Next-Gen Architecture
        </h1>
        <p class="text-slate-400 text-2xl mt-6 font-medium max-w-2xl mx-auto leading-relaxed">
            Unlocking scale and agility with unified cloud intelligence networks.
        </p>
        <div class="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-10 rounded-full"></div>
    </div>
    
    <div class="absolute bottom-12 left-16 flex items-center gap-3 text-slate-500 text-sm font-semibold tracking-widest uppercase font-mono">
        <i class="fa-solid fa-cube text-indigo-500"></i> Slides Sparks
    </div>
    <div class="absolute bottom-12 right-16 text-slate-500 text-sm font-semibold tracking-wider font-mono">
        August 2026
    </div>
</div>
`
  },
  {
    id: 'comparison',
    name: 'Comparison Grid',
    description: 'A detailed two-column comparative matrix slide with status indicators.',
    code: `
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
<style>
    .slide-container {
        width: 1280px;
        height: 720px;
        position: relative;
        background-color: #f8fafc;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: 'Inter', sans-serif;
    }
    .header-section {
        padding: 40px 64px 20px 64px;
        background-color: white;
        border-bottom: 1px solid #f1f5f9;
        z-index: 10;
    }
    .section-tag {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: inline-block;
        margin-bottom: 8px;
    }
    .grid-container {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        padding: 24px 64px 48px 64px;
    }
    .column-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e2e8f0;
    }
    .profit-header { border-bottom-color: #ef4444; }
    .wealth-header { border-bottom-color: #f59e0b; }
    .cards-wrapper {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .alert-card {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 14px 18px;
        display: flex;
        align-items: flex-start;
        gap: 16px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        border: 1px solid #f1f5f9;
        position: relative;
        overflow: hidden;
    }
    .card-stripe-profit {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: #ef4444;
    }
    .card-stripe-wealth {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: #f59e0b;
    }
    .icon-profit {
        color: #ef4444;
        background-color: #fee2e2;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 16px;
    }
    .icon-wealth {
        color: #d97706;
        background-color: #fef3c7;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 16px;
    }
</style>

<div class="slide-container">
    <!-- Header -->
    <div class="header-section">
        <div class="flex justify-between items-end">
            <div>
                <span class="section-tag"><i class="fa-solid fa-triangle-exclamation mr-2"></i>Critical Analysis</span>
                <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Strategic Limitations &amp; Risks</h1>
                <p class="text-slate-500 mt-2 text-lg">Comparative evaluation of inherent disadvantages in both approaches.</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">Comparison Grid</p>
                <div class="h-1 w-24 bg-slate-200 mt-2 ml-auto rounded-full"></div>
            </div>
        </div>
    </div>
    
    <!-- Main Grid Content -->
    <div class="grid-container">
        <!-- Left Column: Profit Maximization -->
        <div class="flex flex-col">
            <div class="column-header profit-header">
                <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
                    <i class="fa-solid fa-chart-bar text-xl"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-slate-900 leading-tight">Profit Maximization</h2>
                    <p class="text-xs text-red-600 font-bold uppercase tracking-wide font-mono">Structural Flaws</p>
                </div>
            </div>
            <div class="cards-wrapper">
                <div class="alert-card card-profit">
                    <div class="card-stripe-profit"></div>
                    <div class="icon-profit"><i class="fa-solid fa-hourglass-end"></i></div>
                    <div>
                        <h3 class="text-base font-bold text-slate-800">Short-Term Focus</h3>
                        <p class="text-sm text-slate-500 mt-1 leading-snug">Prioritizes immediate earnings over long-term sustainability and growth.</p>
                    </div>
                </div>
                <div class="alert-card card-profit">
                    <div class="card-stripe-profit"></div>
                    <div class="icon-profit"><i class="fa-solid fa-dice"></i></div>
                    <div>
                        <h3 class="text-base font-bold text-slate-800">Ignores Risk</h3>
                        <p class="text-sm text-slate-500 mt-1 leading-snug">Fails to distinguish between safe and risky income streams.</p>
                    </div>
                </div>
                <div class="alert-card card-profit">
                    <div class="card-stripe-profit"></div>
                    <div class="icon-profit"><i class="fa-solid fa-clock-rotate-left"></i></div>
                    <div>
                        <h3 class="text-base font-bold text-slate-800">No Time Value</h3>
                        <p class="text-sm text-slate-500 mt-1 leading-snug">Treats current and future dollars as equal, ignoring opportunity cost.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right Column: Wealth Maximization -->
        <div class="flex flex-col">
            <div class="column-header wealth-header">
                <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                    <i class="fa-solid fa-gem text-xl"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-slate-900 leading-tight">Wealth Maximization</h2>
                    <p class="text-xs text-amber-600 font-bold uppercase tracking-wide font-mono">Operational Challenges</p>
                </div>
            </div>
            <div class="cards-wrapper">
                <div class="alert-card card-wealth">
                    <div class="card-stripe-wealth"></div>
                    <div class="icon-wealth"><i class="fa-solid fa-arrow-trend-down"></i></div>
                    <div>
                        <h3 class="text-base font-bold text-slate-800">Market Dependency</h3>
                        <p class="text-sm text-slate-500 mt-1 leading-snug">Stock prices can fluctuate due to external market factors unrelated to performance.</p>
                    </div>
                </div>
                <div class="alert-card card-wealth">
                    <div class="card-stripe-wealth"></div>
                    <div class="icon-wealth"><i class="fa-solid fa-calculator"></i></div>
                    <div>
                        <h3 class="text-base font-bold text-slate-800">Analytical Complexity</h3>
                        <p class="text-sm text-slate-500 mt-1 leading-snug">Requires complex WACC calculations and cash flow projections.</p>
                    </div>
                </div>
                <div class="alert-card card-wealth">
                    <div class="card-stripe-wealth"></div>
                    <div class="icon-wealth"><i class="fa-solid fa-seedling"></i></div>
                    <div>
                        <h3 class="text-base font-bold text-slate-800">Patient Capital</h3>
                        <p class="text-sm text-slate-500 mt-1 leading-snug">Strategies often have long gestation periods before yielding visible returns.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="absolute bottom-6 right-8 text-slate-200 font-black text-6xl opacity-40 z-0 pointer-events-none font-mono">02</div>
</div>
`
  },
  {
    id: 'metrics',
    name: 'Key Metrics',
    description: 'A metric-driven dashboard slide featuring three key performance indicators.',
    code: `
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
<style>
    .slide-container {
        width: 1280px;
        height: 720px;
        position: relative;
        background-color: #fafafa;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: 'Inter', sans-serif;
    }
    .header-section {
        padding: 40px 64px 20px 64px;
        background-color: white;
        border-bottom: 1px solid #eaeaea;
        z-index: 10;
    }
    .section-tag {
        background-color: #e0e7ff;
        color: #3730a3;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: inline-block;
        margin-bottom: 8px;
    }
    .metrics-container {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 24px;
        padding: 48px 64px;
    }
    .metric-card {
        background-color: white;
        border-radius: 12px;
        padding: 32px 24px;
        border: 1px solid #eaeaea;
        box-shadow: 0 4px 10px rgba(0,0,0,0.01);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
    }
    .card-top-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
    }
    .bar-indigo { background: #4f46e5; }
    .bar-emerald { background: #10b981; }
    .bar-violet { background: #8b5cf6; }
</style>

<div class="slide-container">
    <!-- Header -->
    <div class="header-section">
        <div class="flex justify-between items-end">
            <div>
                <span class="section-tag"><i class="fa-solid fa-chart-line mr-2"></i>Performance Report</span>
                <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Q2 Growth Statistics</h1>
                <p class="text-slate-500 mt-2 text-lg">Key performance metrics indicating exponential operational scale.</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">Metrics Dashboard</p>
                <div class="h-1 w-24 bg-indigo-200 mt-2 ml-auto rounded-full"></div>
            </div>
        </div>
    </div>
    
    <!-- Metrics Grid -->
    <div class="metrics-container">
        <!-- Metric 1 -->
        <div class="metric-card">
            <div class="card-top-bar bar-indigo"></div>
            <div>
                <div class="w-12 h-12 rounded-lg bg-indigo-550/10 flex items-center justify-center text-indigo-650 mb-6 text-xl" style="background-color: #e0e7ff; color: #4f46e5;">
                    <i class="fa-solid fa-users"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800">User Acquisition</h3>
                <p class="text-sm text-slate-400 mt-1 leading-snug">New active user counts registered weekly.</p>
            </div>
            <div class="mt-8">
                <div class="text-5xl font-black text-indigo-600 tracking-tight">+148%</div>
                <div class="text-xs text-indigo-500 font-bold uppercase tracking-wider mt-2 font-mono"><i class="fa-solid fa-caret-up mr-1"></i>Exceeding Target</div>
            </div>
        </div>
        
        <!-- Metric 2 -->
        <div class="metric-card">
            <div class="card-top-bar bar-emerald"></div>
            <div>
                <div class="w-12 h-12 rounded-lg bg-emerald-550/10 flex items-center justify-center text-emerald-650 mb-6 text-xl" style="background-color: #d1fae5; color: #10b981;">
                    <i class="fa-solid fa-hand-holding-dollar"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800">Net Revenue Runrate</h3>
                <p class="text-sm text-slate-400 mt-1 leading-snug">Annualized gross earnings index.</p>
            </div>
            <div class="mt-8">
                <div class="text-5xl font-black text-emerald-600 tracking-tight">$4.8M</div>
                <div class="text-xs text-emerald-500 font-bold uppercase tracking-wider mt-2 font-mono"><i class="fa-solid fa-caret-up mr-1"></i>Healthy Margin</div>
            </div>
        </div>
        
        <!-- Metric 3 -->
        <div class="metric-card">
            <div class="card-top-bar bar-violet"></div>
            <div>
                <div class="w-12 h-12 rounded-lg bg-violet-550/10 flex items-center justify-center text-violet-650 mb-6 text-xl" style="background-color: #ede9fe; color: #8b5cf6;">
                    <i class="fa-solid fa-bolt"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800">Server Latency</h3>
                <p class="text-sm text-slate-400 mt-1 leading-snug">Average query round-trip duration.</p>
            </div>
            <div class="mt-8">
                <div class="text-5xl font-black text-violet-600 tracking-tight">14ms</div>
                <div class="text-xs text-violet-500 font-bold uppercase tracking-wider mt-2 font-mono"><i class="fa-solid fa-check mr-1"></i>99.9% Uptime</div>
            </div>
        </div>
    </div>
    
    <div class="absolute bottom-6 right-8 text-slate-200 font-black text-6xl opacity-40 z-0 pointer-events-none font-mono">03</div>
</div>
`
  },
  {
    id: 'features',
    name: 'Feature Showcase',
    description: 'A presentation template outlining product features using grids and icons.',
    code: `
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
<style>
    .slide-container {
        width: 1280px;
        height: 720px;
        position: relative;
        background-color: white;
        overflow: hidden;
        display: flex;
        font-family: 'Inter', sans-serif;
    }
    .left-panel {
        width: 420px;
        background-color: #fafafa;
        border-right: 1px solid #f0f0f0;
        padding: 64px 48px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .right-panel {
        flex: 1;
        padding: 64px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        align-content: center;
    }
    .feature-tag {
        background-color: #f0fdf4;
        color: #166534;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: inline-block;
        margin-bottom: 12px;
    }
    .showcase-card {
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #eaeaea;
        background-color: white;
        transition: box-shadow 0.2s;
    }
    .card-icon {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        background-color: #f4f4f5;
        color: #18181b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        margin-bottom: 16px;
    }
</style>

<div class="slide-container">
    <!-- Left Intro Panel -->
    <div class="left-panel">
        <div>
            <span class="feature-tag"><i class="fa-solid fa-gem mr-2"></i>Product Core</span>
            <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-2">Engineered for Velocity</h1>
            <p class="text-slate-500 text-base mt-4 leading-relaxed">
                A robust stack optimized for performance, seamless integration, and modular deployments.
            </p>
        </div>
        <div>
            <p class="text-xs text-slate-400 font-bold tracking-widest uppercase font-mono">Features Matrix</p>
            <div class="h-1 w-16 bg-slate-200 mt-2 rounded-full"></div>
        </div>
    </div>
    
    <!-- Right Features Grid -->
    <div class="right-panel">
        <!-- Feature 1 -->
        <div class="showcase-card">
            <div class="card-icon"><i class="fa-solid fa-code-compare"></i></div>
            <h3 class="text-base font-bold text-slate-800">Dynamic Translation</h3>
            <p class="text-sm text-slate-500 mt-1 leading-snug">Parses nested elements accurately to native formats.</p>
        </div>
        
        <!-- Feature 2 -->
        <div class="showcase-card">
            <div class="card-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <h3 class="text-base font-bold text-slate-800">Real-Time Sync</h3>
            <p class="text-sm text-slate-500 mt-1 leading-snug">Saves structural updates instantly inside browser frames.</p>
        </div>
        
        <!-- Feature 3 -->
        <div class="showcase-card">
            <div class="card-icon"><i class="fa-solid fa-bezier-curve"></i></div>
            <h3 class="text-base font-bold text-slate-800">Asymmetric Mapping</h3>
            <p class="text-sm text-slate-500 mt-1 leading-snug">Processes borders, padding, and alignments elegantly.</p>
        </div>
        
        <!-- Feature 4 -->
        <div class="showcase-card">
            <div class="card-icon"><i class="fa-solid fa-file-pdf"></i></div>
            <h3 class="text-base font-bold text-slate-800">Vector Rasterizing</h3>
            <p class="text-sm text-slate-500 mt-1 leading-snug">Converts external CDN assets prior to export.</p>
        </div>
    </div>
    
    <div class="absolute bottom-6 right-8 text-slate-200 font-black text-6xl opacity-40 z-0 pointer-events-none font-mono">04</div>
</div>
`
  },
  {
    id: 'quote',
    name: 'Minimalist Quote',
    description: 'A clean, high-impact quote slide with elegant styling and typography.',
    code: `
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Inter:wght@400;500;700&display=swap" rel="stylesheet"/>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
<style>
    .slide-container {
        width: 1280px;
        height: 720px;
        position: relative;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Inter', sans-serif;
        padding: 80px;
        color: white;
    }
    .quote-mark {
        font-family: 'Playfair Display', serif;
        font-size: 140px;
        line-height: 0.1;
        color: rgba(255, 255, 255, 0.15);
        margin-bottom: 24px;
    }
    .quote-text {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-weight: 600;
        font-size: 38px;
        line-height: 1.4;
        text-align: center;
        max-width: 800px;
        z-index: 10;
        color: #ffffff;
    }
    .author-section {
        margin-top: 40px;
        text-align: center;
        z-index: 10;
    }
    .accent-bg {
        position: absolute;
        width: 700px;
        height: 700px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%);
        pointer-events: none;
    }
</style>

<div class="slide-container">
    <div class="accent-bg"></div>
    
    <div class="quote-mark">“</div>
    
    <p class="quote-text">
        Simplicity is the ultimate sophistication. When you remove the clutter, the purity of design and purpose shines through.
    </p>
    
    <div class="author-section">
        <div class="text-xl font-bold text-white tracking-wide">Steve Jobs</div>
        <div class="text-sm font-semibold text-indigo-200 uppercase tracking-widest mt-1 font-mono">Founder, Apple Inc.</div>
    </div>
    
    <div class="absolute bottom-12 left-16 flex items-center gap-3 text-indigo-200/50 text-sm font-semibold tracking-widest uppercase font-mono">
        <i class="fa-solid fa-quote-left"></i> Key Takeaway
    </div>
    <div class="absolute bottom-12 right-16 text-indigo-200/50 text-sm font-semibold tracking-wider font-mono">
        05
    </div>
</div>
`
  }
];
