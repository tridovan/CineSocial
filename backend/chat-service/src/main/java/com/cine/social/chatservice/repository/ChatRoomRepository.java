package com.cine.social.chatservice.repository;

import com.cine.social.chatservice.entity.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    @Query("{ 'type': 'PRIVATE', 'memberIds': { $all: [?0, ?1], $size: 2 } }")
    Optional<ChatRoom> findExistingPrivateRoom(String userId1, String userId2);

    List<ChatRoom> findByMemberIdsContaining(String userId);

}