package com.diedev.HotelBooking.repo;

import com.diedev.HotelBooking.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends MongoRepository<Booking, String> {


    Optional<Booking> findByBookingConfirmationCode(String confirmationCode);

    //La fecha de entrada es menor o igual que la fecha de salida, mientras que la fecha de salida es mayor o igual que la fecha de entrada
    @Query("{ 'checkInDate': { $lte: ?1 }, 'checkOutDate': { $gte: ?0 } }")
    List<Booking> findBookingsByDateRange(LocalDate checkInDate, LocalDate checkOutDate);


}