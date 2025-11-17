package com.diedev.HotelBooking.service.interf;

import com.diedev.HotelBooking.dto.Response;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IRoomService {

    Response addNewRoom(String photoUrl, String roomType, BigDecimal roomPrice, String description);

    List<String> getAllRoomTypes();

    Response getAllRooms();

    Response deleteRoom(String roomId);

    Response updateRoom(String roomId, String description, String roomType, BigDecimal roomPrice, String photoUrl);

    Response getRoomById(String roomId);

    Response getAvailableRoomsByDateAndType(LocalDate checkInDate, LocalDate checkOutDate, String roomType);

    Response getAllAvailableRooms();
}
