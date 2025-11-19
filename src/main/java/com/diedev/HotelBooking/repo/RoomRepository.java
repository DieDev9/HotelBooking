package com.diedev.HotelBooking.repo;

import com.diedev.HotelBooking.model.Room;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface RoomRepository extends MongoRepository<Room, String> {

    @Aggregation("{ $group: { _id: '$roomType'} }")
    List<String> findDistinctRoomType();

    @Query("{ 'bookings': {$size: 0 } }")
    List<Room> findAllAvailableRooms();

    List<Room> findByRoomTypeLikeAndIdNotIn(String roomType, List<String> bookedRoomIds);
}