-- Add Check Constraints
ALTER TABLE `Flight` ADD CONSTRAINT `chk_departure_arrival` CHECK (`arrivalTime` > `departureTime`);