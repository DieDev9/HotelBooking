package com.diedev.HotelBooking.service.interf;

import com.diedev.HotelBooking.dto.LoginRequest;
import com.diedev.HotelBooking.dto.Response;
import com.diedev.HotelBooking.model.User;

public interface IUserService {

    Response register(User user);

    Response login(LoginRequest loginRequest);

    Response getAllUsers();

    Response getUSerBookingHistory(String userId);

    Response deleteUser(String userId);

    Response getUserById(String userId);

    Response getMyInfo(String email);
}