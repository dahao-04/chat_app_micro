package com.chatapp.authent_service.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.chatapp.authent_service.Entity.RefreshToken;

@Repository
public interface RefreshTokenRepository extends MongoRepository <RefreshToken, String>{

}
