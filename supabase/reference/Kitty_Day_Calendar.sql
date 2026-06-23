CREATE TABLE `Login/Signup`(
    `id` CHAR(36) NOT NULL,
    `Name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `User Profile`(
    `id` CHAR(36) NOT NULL,
    `Profile Picture` BLOB NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `Name` VARCHAR(255) NOT NULL,
    `Preferred Name` VARCHAR(255) NOT NULL,
    `Password` VARCHAR(255) NOT NULL,
    `Change Password` VARCHAR(255) NOT NULL,
    `Confirm Current Password` VARCHAR(255) NOT NULL,
    `New Password` VARCHAR(255) NOT NULL,
    `Confirm New Password` VARCHAR(255) NOT NULL,
    `Events_id` CHAR(36) NOT NULL,
    `User Events` TIMESTAMP NOT NULL,
    `Family Account?` BOOLEAN NOT NULL,
    `Family Account id` CHAR(36) NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `User Events`(
    `id` CHAR(36) NOT NULL,
    `Events_id` CHAR(36) NOT NULL,
    `Event Name` VARCHAR(255) NOT NULL,
    `Event Date` DATE NOT NULL,
    `Event Time` TIME NOT NULL,
    `Notification?` BOOLEAN NOT NULL,
    `Event_Image?` BOOLEAN NOT NULL,
    `Event_Image_id` CHAR(36) NOT NULL,
    `Event Expiration` DATETIME NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `Event_Image_Details`(
    `id` CHAR(36) NOT NULL,
    `Event_Image_id` CHAR(36) NOT NULL,
    `Image` BLOB NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `Calender`(
    `id` CHAR(36) NOT NULL,
    `Events_id` CHAR(36) NOT NULL,
    `Federal Holidays?` BOOLEAN NOT NULL,
    `International Holidays?` BOOLEAN NOT NULL,
    `Daily Cat Image` BLOB NOT NULL,
    `Daily Login Message` VARCHAR(255) NOT NULL,
    `Calender id` CHAR(36) NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `Cat_Image_Details`(
    `id` CHAR(36) NOT NULL,
    `Daily Cat Image id` CHAR(36) NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `Daily_Login_Message_Details`(
    `id` CHAR(36) NOT NULL,
    `Daily Login Message id` CHAR(36) NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `Family Account`(
    `id` CHAR(36) NOT NULL,
    `Family Account id` CHAR(36) NOT NULL,
    `Profile 1 id` CHAR(36) NOT NULL,
    `Calender id` CHAR(36) NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `Profile 1`(
    `id` CHAR(36) NOT NULL,
    `Profile 1 id` CHAR(36) NOT NULL,
    `Name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `Phone Number` VARCHAR(255) NOT NULL,
    `Notificaitons on?` BOOLEAN NOT NULL,
    `My Events id` CHAR(36) NOT NULL,
    `Calender id` CHAR(36) NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `My Events`(
    `id` CHAR(36) NOT NULL,
    `My Events id` CHAR(36) NOT NULL,
    `My Event` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id`)
);
ALTER TABLE
    `Event_Image_Details` ADD CONSTRAINT `event_image_details_event_image_id_foreign` FOREIGN KEY(`Event_Image_id`) REFERENCES `User Events`(`Event_Image_id`);
ALTER TABLE
    `Calender` ADD CONSTRAINT `calender_calender id_foreign` FOREIGN KEY(`Calender id`) REFERENCES `Family Account`(`Calender id`);
ALTER TABLE
    `Calender` ADD CONSTRAINT `calender_events_id_foreign` FOREIGN KEY(`Events_id`) REFERENCES `User Events`(`Events_id`);
ALTER TABLE
    `My Events` ADD CONSTRAINT `my events_my events id_foreign` FOREIGN KEY(`My Events id`) REFERENCES `Profile 1`(`My Events id`);
ALTER TABLE
    `Profile 1` ADD CONSTRAINT `profile 1_calender id_foreign` FOREIGN KEY(`Calender id`) REFERENCES `Calender`(`Calender id`);
ALTER TABLE
    `User Profile` ADD CONSTRAINT `user profile_family account id_foreign` FOREIGN KEY(`Family Account id`) REFERENCES `Family Account`(`Family Account id`);
ALTER TABLE
    `Daily_Login_Message_Details` ADD CONSTRAINT `daily_login_message_details_daily login message id_foreign` FOREIGN KEY(`Daily Login Message id`) REFERENCES `Calender`(`Daily Login Message`);
ALTER TABLE
    `Cat_Image_Details` ADD CONSTRAINT `cat_image_details_daily cat image id_foreign` FOREIGN KEY(`Daily Cat Image id`) REFERENCES `Calender`(`Daily Cat Image`);
ALTER TABLE
    `Profile 1` ADD CONSTRAINT `profile 1_profile 1 id_foreign` FOREIGN KEY(`Profile 1 id`) REFERENCES `Family Account`(`Profile 1 id`);
ALTER TABLE
    `User Profile` ADD CONSTRAINT `user profile_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `Login/Signup`(`user_id`);
ALTER TABLE
    `User Events` ADD CONSTRAINT `user events_events_id_foreign` FOREIGN KEY(`Events_id`) REFERENCES `User Profile`(`Events_id`);