package com.chatapp.authent_service.Repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.chatapp.authent_service.Entity.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUserEmail (String user_email);
    boolean existsByUserEmail (String user_email);
}
