import { HeroSection } from '../../components/home/HeroSection';
import { FeaturedDestinations } from '../../components/home/FeaturedDestinations';
import { RecommendedTours } from '../../components/home/RecommendedTours';
import { FlashSale } from '../../components/home/FlashSale';
import { LatestBlogs } from '../../components/home/LatestBlogs';
const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedDestinations />
      <FlashSale />
      <RecommendedTours />
      <LatestBlogs />
    </>
  );
};

export default Home;
