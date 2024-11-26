-- CreateTable
CREATE TABLE `Users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(191) NOT NULL,
    `user_email` VARCHAR(191) NOT NULL,
    `user_password` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `account_status` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Users_user_name_key`(`user_name`),
    UNIQUE INDEX `Users_user_email_key`(`user_email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Character` (
    `character_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `character_name` VARCHAR(191) NOT NULL,
    `character_money` INTEGER NOT NULL DEFAULT 0,
    `character_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `character_status` VARCHAR(191) NOT NULL,
    `attack` INTEGER NOT NULL DEFAULT 10,
    `defense` INTEGER NOT NULL DEFAULT 10,
    `health` INTEGER NOT NULL DEFAULT 100,

    PRIMARY KEY (`character_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_name` VARCHAR(191) NOT NULL,
    `item_description` VARCHAR(191) NOT NULL,
    `item_type` VARCHAR(191) NOT NULL,
    `item_rarity` VARCHAR(191) NOT NULL,
    `item_stats` JSON NOT NULL,
    `item_price` INTEGER NOT NULL,
    `item_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `item_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `inventory_id` INTEGER NOT NULL AUTO_INCREMENT,
    `character_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `item_quantity` INTEGER NOT NULL DEFAULT 1,
    `is_equipped` BOOLEAN NOT NULL DEFAULT false,
    `item_added_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`inventory_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquippedItem` (
    `equipped_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `character_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `item_slot` VARCHAR(191) NOT NULL,
    `equipped_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`equipped_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_character_id_fkey` FOREIGN KEY (`character_id`) REFERENCES `Character`(`character_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquippedItem` ADD CONSTRAINT `EquippedItem_character_id_fkey` FOREIGN KEY (`character_id`) REFERENCES `Character`(`character_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquippedItem` ADD CONSTRAINT `EquippedItem_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
