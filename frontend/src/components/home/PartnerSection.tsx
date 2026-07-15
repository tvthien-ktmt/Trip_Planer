
export const PartnerSection = () => {
  const partners = [
    { name: "Axon", opacity: "opacity-50 hover:opacity-100" },
    { name: "Jetstar", opacity: "opacity-50 hover:opacity-100" },
    { name: "Expedia", opacity: "opacity-50 hover:opacity-100" },
    { name: "Qantas", opacity: "opacity-50 hover:opacity-100" },
    { name: "Alitalia", opacity: "opacity-50 hover:opacity-100" }
  ];

  return (
    <section className="py-12 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-custom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
          {partners.map((partner, idx) => (
            <div key={idx} className={`text-2xl font-bold text-gray-400 dark:text-gray-500 transition-opacity duration-300 cursor-pointer ${partner.opacity}`}>
              {/* Using text as placeholder for partner logos */}
              {partner.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
