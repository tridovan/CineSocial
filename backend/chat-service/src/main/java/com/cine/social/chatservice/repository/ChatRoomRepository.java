package com.cine.social.chatservice.repository;

import com.cine.social.chatservice.entity.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {

    List<ChatRoom> findByMemberIdsContaining(String userId);

}