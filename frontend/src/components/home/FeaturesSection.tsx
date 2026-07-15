
export const FeaturesSection = () => {
  const features = [
    { count: "120+", label: "Holiday Package" },
    { count: "85", label: "Luxury Hotel" },
    { count: "7", label: "Premium Airlines" },
    { count: "2k+", label: "Happy Customer" }
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-custom relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            {/* Image Placeholder */}
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-[3rem] overflow-hidden relative shadow-2xl">
              <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop" alt="Features" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-gray-500 font-semibold uppercase tracking-wider mb-2">Our Features</h3>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Our invaluable <br /> experience making <br /> travelers happy
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-lg leading-relaxed">
              We always make our customer happy by providing as many choices as possible.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              {features.map((feature, idx) => (
                <div key={idx}>
                  <div className="text-4xl font-bold text-primary mb-2">{feature.count}</div>
                  <div className="text-gray-500 dark:text-gray-400 font-medium">{feature.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
