-- RenameIndex
ALTER TABLE `bookingitem` RENAME INDEX `BookingItem_bookingId_fkey` TO `BookingItem_bookingId_idx`;

-- RenameIndex
ALTER TABLE `bookingpassenger` RENAME INDEX `BookingPassenger_bookingId_fkey` TO `BookingPassenger_bookingId_idx`;

-- RenameIndex
ALTER TABLE `tourimage` RENAME INDEX `TourImage_tourId_fkey` TO `TourImage_tourId_idx`;

-- RenameIndex
ALTER TABLE `touritinerary` RENAME INDEX `TourItinerary_tourId_fkey` TO `TourItinerary_tourId_idx`;
