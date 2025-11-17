package com.diedev.HotelBooking.service.impl;

import com.diedev.HotelBooking.dto.Response;
import com.diedev.HotelBooking.dto.RoomDTO;
import com.diedev.HotelBooking.exception.OurException;
import com.diedev.HotelBooking.model.Booking;
import com.diedev.HotelBooking.model.Room;
import com.diedev.HotelBooking.repo.BookingRepository;
import com.diedev.HotelBooking.repo.RoomRepository;
import com.diedev.HotelBooking.service.interf.IRoomService;
import com.diedev.HotelBooking.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class RoomService implements IRoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;


    @Override
    public Response addNewRoom(String photoUrl, String roomType, BigDecimal roomPrice, String description) {

        Response response = new Response();

        try {
            Room room = new Room();
            room.setRoomPhotoUrl(photoUrl);          // URL de internet
            room.setRoomPrice(roomPrice);
            room.setRoomType(roomType);
            room.setRoomDescription(description);

            Room savedRoom = roomRepository.save(room);
            RoomDTO roomDTO = Utils.mapRoomEntityToRoomDTO(savedRoom);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setRoom(roomDTO);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred while saving a room: " + e.getMessage());
        }

        return response;
    }


    @Override
    public List<String> getAllRoomTypes() {
        return roomRepository.findDistinctRoomType();
    }


    @Override
    public Response getAllRooms() {

        Response response = new Response();

        try {
            List<Room> roomList = roomRepository.findAll();
            List<RoomDTO> roomDTOList = Utils.mapRoomListEntityToRoomListDTO(roomList);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setRoomList(roomDTOList);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred while getting all rooms: " + e.getMessage());
        }

        return response;
    }


    @Override
    public Response deleteRoom(String roomId) {

        Response response = new Response();

        try {
            roomRepository.findById(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));

            roomRepository.deleteById(roomId);

            response.setStatusCode(200);
            response.setMessage("successful");

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred while deleting a room: " + e.getMessage());
        }

        return response;
    }


    @Override
    public Response updateRoom(String roomId, String description, String roomType,
                               BigDecimal roomPrice, String photoUrl) {

        Response response = new Response();

        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));

            if (roomType != null) room.setRoomType(roomType);
            if (roomPrice != null) room.setRoomPrice(roomPrice);
            if (description != null) room.setRoomDescription(description);
            if (photoUrl != null) room.setRoomPhotoUrl(photoUrl); // URL de internet

            Room updatedRoom = roomRepository.save(room);
            RoomDTO roomDTO = Utils.mapRoomEntityToRoomDTO(updatedRoom);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setRoom(roomDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred while updating a room: " + e.getMessage());
        }

        return response;
    }


    @Override
    public Response getRoomById(String roomId) {

        Response response = new Response();

        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));

            RoomDTO roomDTO = Utils.mapRoomEntityToRoomDTOPlusBookings(room);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setRoom(roomDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred while getting room by id: " + e.getMessage());
        }

        return response;
    }


    @Override
    public Response getAvailableRoomsByDateAndType(LocalDate checkInDate, LocalDate checkOutDate, String roomType) {

        Response response = new Response();

        try {
            List<Booking> bookings = bookingRepository.findBookingsByDateRange(checkInDate, checkOutDate);
            List<String> bookedRoomsId = bookings.stream()
                    .map(booking -> booking.getRoom().getId())
                    .toList();

            List<Room> availableRooms =
                    roomRepository.findByRoomTypeLikeAndIdNotIn(roomType, bookedRoomsId);

            List<RoomDTO> roomDTOList =
                    Utils.mapRoomListEntityToRoomListDTO(availableRooms);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setRoomList(roomDTOList);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred while getting available rooms: " + e.getMessage());
        }

        return response;
    }


    @Override
    public Response getAllAvailableRooms() {

        Response response = new Response();

        try {
            List<Room> roomList = roomRepository.findAllAvailableRooms();
            List<RoomDTO> roomDTOList =
                    Utils.mapRoomListEntityToRoomListDTO(roomList);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setRoomList(roomDTOList);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred while getting all available rooms: " + e.getMessage());
        }

        return response;
    }
}
