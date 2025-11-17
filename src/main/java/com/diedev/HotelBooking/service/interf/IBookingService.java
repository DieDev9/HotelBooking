package com.diedev.HotelBooking.service.interf;

import com.diedev.HotelBooking.dto.Response;
import com.diedev.HotelBooking.model.Booking;

public interface IBookingService {

    Response saveBooking(String rooId, String userId, Booking bookingRequest);

    Response findBookingByConfirmationCode(String confirmationCode);

    Response getAllBookings();

    Response cancelBooking(String bookingId);
}