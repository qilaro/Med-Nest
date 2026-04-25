import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 pb-20 bg-white">
      {/* Hero Section Wrapper - CLEANED 1:1 CLONE */}
      <section className="py-12 text-gray-900 bg-white">
        <div 
          className="container-medq py-16 relative overflow-hidden mx-auto" 
          style={{ 
            backgroundColor: '#D5E9E7', 
            borderRadius: '3rem', 
            maxWidth: '90rem', 
            boxShadow: '0 50px 80px -20px rgba(0, 0, 0, 0.2), 0 30px 50px -15px rgba(0, 0, 0, 0.12)' 
          }}
        >
          {/* Top Edge Gradient Line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)' }}></div>
          
          {/* Curvy Dashed Lines - ONLY these should be visible inside the teal panel */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path d="M50,0 Q0,150 50,300" fill="none" stroke="#57B8A6" strokeWidth="2" strokeDasharray="10 10" />
          </svg>

          {/* White Hero Card with Rounded Edges and Shadow */}
          <div
            className="hero-panel relative overflow-hidden mx-auto"
            style={{
              backgroundImage: "url('/images/hero-bg.png')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              maxWidth: '80rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              borderRadius: '2rem'
            }}
          >
            <div className="relative z-10 max-w-3xl text-left hero-panel-content">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/65 border border-gray-300 rounded-full px-4 py-2 text-sm mb-4 mt-1 text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-yellow-400" aria-hidden="true">
                  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                </svg>
                Trusted by millions of patients & caregivers
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-gray-900" style={{ whiteSpace: 'nowrap' }}>
                Learn more. <span style={{ color: 'var(--primary)' }}>Live better.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-700 mb-6 max-w-2xl">
                Your comprehensive source for drug information, interaction checking, and personalized medication guidance.
              </p>

              {/* Search Bar */}
              <form className="max-w-xl">
                <div className="flex gap-2 bg-white rounded-2xl py-1.5 pl-1.5 pr-4 shadow-2xl border border-gray-100">
                  <div className="flex-1 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true">
                      <path d="m21 21-4.34-4.34"></path>
                      <circle cx="11" cy="11" r="8"></circle>
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search any drug name, ingredient, or condition..." 
                      className="w-full pl-12 pr-4 py-2 text-gray-800 rounded-xl focus:outline-none text-base bg-transparent border-none" 
                    />
                  </div>
                  <button type="submit" className="px-8 py-2 rounded-xl font-semibold text-white text-base" style={{ backgroundColor: 'var(--primary)' }}>
                    Search
                  </button>
                </div>
              </form>

              {/* Suggestions */}
              <div className="flex flex-wrap justify-start gap-2 mt-4">
                {['Antibiotics', 'Blood Pressure', 'Cholesterol', 'Diabetes'].map((tag) => (
                  <Link key={tag} className="px-4 py-1.5 bg-white/65 hover:bg-white border border-gray-300 rounded-full text-sm text-gray-800 transition-colors" href="#">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-3 relative bg-gray-50">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, #57B8A6 0%, transparent 50%, #57B8A6 100%)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, #57B8A6 0%, transparent 50%, #57B8A6 100%)' }}></div>
        <div className="container-medq">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Drugs Listed', value: '20' },
              { label: 'Drug Classes', value: '19' },
              { label: 'Companies', value: '9' },
              { label: 'Patient Reviews', value: '6' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
