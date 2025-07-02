package com.chatapp.authent_service.Entity;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Document (collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults ( level = AccessLevel.PRIVATE )

public class User {
    @Id
    String id;

    @Field ("user_email")
    String userEmail;

    @Field ("user_name")
    String userName;

    @Field ("user_password")
    String userPassword;

    @Field ("createdAt")
    Date createAt;

    @Field ("role")
    String role;
}
