
export const ServicesSection = () => {
  const services = [
    { title: "Calculated Weather", desc: "Built Wicket longer admire do barton vanity itself do in it." },
    { title: "Best Flights", desc: "Engrossed listening. Park gate sell they west hard for the." },
    { title: "Local Events", desc: "Barton vanity itself do in it. Preferred to sportsmen it engrossed listening." },
    { title: "Customization", desc: "We deliver outsourced aviation services for military customers" }
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-900 transition-custom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-gray-500 font-semibold uppercase tracking-wider mb-2">Category</h3>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            We Offer Best Services
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="p-8 text-center rounded-3xl hover:shadow-xl dark:hover:shadow-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer">
              <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full mb-6"></div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
