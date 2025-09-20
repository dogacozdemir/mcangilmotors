-- AlterTable
ALTER TABLE `blog_posts` ADD COLUMN `img_url` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `blog_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `image_path` VARCHAR(255) NOT NULL,
    `is_main` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog_images` ADD CONSTRAINT `blog_images_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
