-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: quiz_generator
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `choices`
--

DROP TABLE IF EXISTS `choices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `choices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `text` text NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `choices_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=233 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `choices`
--

LOCK TABLES `choices` WRITE;
/*!40000 ALTER TABLE `choices` DISABLE KEYS */;
INSERT INTO `choices` VALUES (1,1,'a',0),(2,1,'a',0),(3,1,'a',0),(4,1,'a',0),(5,2,'a',0),(6,2,'a',0),(7,2,'a',0),(8,2,'a',0),(9,3,'s',0),(10,3,'s',0),(11,3,'s',0),(12,3,'s',0),(13,4,'sao há»a',0),(14,4,'trĂ¡i Ä‘áº¥t',0),(15,4,'sao kim',0),(16,4,'máº·t trÄƒng',0),(17,5,'rabbit',0),(18,5,'turtle',0),(19,5,'cat',0),(20,5,'dog',0),(21,6,'sai',0),(22,6,'Ä‘Ăºng ',0),(23,6,'sai',0),(24,6,'sai',0),(25,7,'a',0),(26,7,'d',0),(27,7,'d',0),(28,7,'s',0),(29,8,'1',0),(30,8,'23',0),(31,8,'3',0),(32,8,'1',0),(33,9,'a',0),(34,9,'d',0),(35,9,'d',0),(36,9,'a',0),(37,10,'a',0),(38,10,'a',0),(39,10,'s',0),(40,10,'s',0),(41,11,'s',0),(42,11,'s',0),(43,11,'s',0),(44,11,'s',0),(45,12,'1',0),(46,12,'23',0),(47,12,'3',0),(48,12,'1',0),(49,13,'a',0),(50,13,'d',0),(51,13,'d',0),(52,13,'a',0),(53,14,'a',0),(54,14,'a',0),(55,14,'s',0),(56,14,'s',0),(57,15,'Ä‘Ăºng',0),(58,15,'sai',0),(59,15,'s',0),(60,15,'s',0),(61,16,'s',0),(62,16,'s',0),(63,16,'s',0),(64,16,'s',0),(65,17,'s',0),(66,17,'s',0),(67,17,'s',0),(68,17,'s',0),(69,18,'s',0),(70,18,'s',0),(71,18,'s',0),(72,18,'s',0),(73,19,'s',0),(74,19,'s',0),(75,19,'s',0),(76,19,'s',0),(77,20,'s',0),(78,20,'s',0),(79,20,'s',0),(80,20,'s',0),(81,21,'ss',1),(82,21,'s',0),(83,21,'s',0),(84,21,'s',0),(85,22,'Ä‘Ăºng ',1),(86,22,'sai',0),(87,22,'sai ',0),(88,22,'sai',0),(89,23,'Ä‘Ăºng ',1),(90,23,'sai ',0),(91,23,'sai ',0),(92,23,'sai',0),(93,24,'d',0),(94,24,'s',1),(95,24,'a',0),(96,24,'d',0),(97,25,'s',1),(98,25,'s',0),(99,25,'s',0),(100,25,'s',0),(101,26,'sai',1),(102,26,'Ä‘Ăºng',0),(103,26,'sai ',0),(104,26,'Ä‘Ăºng',0),(105,27,'s',0),(106,27,'ss',1),(107,27,'s',0),(108,27,'s',0),(109,28,'s',1),(110,28,'s',0),(111,28,'s',0),(112,28,'s',0),(113,29,'bĂ² ',1),(114,29,'gĂ  ',0),(115,29,'vá»‹t',0),(116,29,'ngá»—ng',0),(117,30,'gĂ  ',1),(118,30,'chim cĂ¡nh cá»¥t',0),(119,30,'háº£i Ă¢u',0),(120,30,'tuáº§n lá»™c',0),(121,31,'s',1),(122,31,'s',0),(123,31,'s',0),(124,31,'s',0),(125,32,'s',1),(126,32,'s',0),(127,32,'s',0),(128,32,'s',0),(129,33,'s',1),(130,33,'s',0),(131,33,'s',0),(132,33,'s',0),(133,34,'s',1),(134,34,'s',0),(135,34,'s',0),(136,34,'s',0),(137,35,'s',1),(138,35,'s',0),(139,35,'s',0),(140,35,'s',0),(141,36,'s',1),(142,36,'s',0),(143,36,'s',0),(144,36,'s',0),(145,37,'s',1),(146,37,'s',0),(147,37,'s',0),(148,37,'s',0),(149,38,'anh lá»™c',1),(150,38,'anh lá»™c iu',0),(151,38,'Ă´ng CĂºn ',0),(152,38,'cáº£ 3 Ä‘Ă¡p Ă¡n trĂªn',0),(153,39,'cÆ¡m',1),(154,39,'phá»Ÿ',0),(155,39,'há»§ tiáº¿u ',0),(156,39,'bĂ¡nh canh',0),(157,40,'canh ',1),(158,40,'gáº¥u',0),(159,40,'há»i',0),(160,40,'chocopie',0),(161,41,'anh lá»™c',1),(162,41,'anh lá»™c iu',0),(163,41,'Ă´ng CĂºn ',0),(164,41,'cáº£ 3 Ä‘Ă¡p Ă¡n trĂªn',0),(165,42,'cÆ¡m',1),(166,42,'phá»Ÿ',0),(167,42,'há»§ tiáº¿u ',0),(168,42,'bĂ¡nh canh',0),(169,43,'canh ',0),(170,43,'gáº¥u',1),(171,43,'há»i',0),(172,43,'chocopie',0),(173,44,'s',1),(174,44,'s',0),(175,44,'s',0),(176,44,'s',0),(177,45,'s',1),(178,45,'s',0),(179,45,'s',0),(180,45,'s',0),(181,46,'vital',1),(182,46,'sheer',0),(183,46,'medieval',0),(184,46,'emergence',0),(185,47,'vital',1),(186,47,'sheer',0),(187,47,'medieval',0),(188,47,'emergence',0),(189,48,'2',0),(190,48,'3',0),(191,48,'4',0),(192,48,'5',1),(193,49,'chĂ³ ',0),(194,49,'gĂ ',1),(195,49,'thá»',0),(196,49,'chim',0),(201,51,'a',1),(202,51,'Ă¡',0),(203,51,'s',0),(204,51,'a',0),(205,50,'chĂ³ ',0),(206,50,'gĂ ',0),(207,50,'thá»',1),(208,50,'chim',0),(209,52,'chĂ³ ',0),(210,52,'gĂ ',0),(211,52,'thá»',1),(212,52,'chim',0),(213,53,'a',1),(214,53,'Ă¡',0),(215,53,'s',0),(216,53,'a',0),(217,54,'s',1),(218,54,'s',0),(219,54,'s',0),(220,54,'s',0),(221,55,'s',1),(222,55,'s',0),(223,55,'s',0),(224,55,'s',0),(225,56,'s',1),(226,56,'s',0),(227,56,'s',0),(228,56,'s',0),(229,57,'t',1),(230,57,'t',0),(231,57,'t',0),(232,57,'t',0);
/*!40000 ALTER TABLE `choices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `text` text NOT NULL,
  `correct_choice_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  KEY `fk_correct_choice` (`correct_choice_id`),
  CONSTRAINT `fk_correct_choice` FOREIGN KEY (`correct_choice_id`) REFERENCES `choices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,'aaa',NULL),(2,2,'aaa',NULL),(3,2,'s',NULL),(4,3,'con ngÆ°á»i báº¯t Ä‘áº§u tá»« Ä‘Ă¢u',NULL),(5,4,'what is this',NULL),(6,5,'cĂ¢u há»i má»›i',NULL),(7,6,'má»›i',NULL),(8,9,'7',NULL),(9,9,'a',NULL),(10,9,'s',NULL),(11,10,'sss',NULL),(12,11,'7',NULL),(13,11,'a',NULL),(14,11,'s',NULL),(15,12,'cĂ¢u há»i',NULL),(16,13,'s',NULL),(17,14,'s',NULL),(18,15,'s',NULL),(19,16,'s',NULL),(20,17,'s',NULL),(21,18,'s',81),(22,19,'cĂ¢u há»i',85),(23,19,'cĂ¢u há»i ',89),(24,20,'a',94),(25,21,'ss',97),(26,22,'cĂ¢u há»i cá»§a ss',101),(27,23,'ss',106),(28,24,'ss',109),(29,25,'con gĂ¬ cĂ³ 4 chĂ¢n',113),(30,25,'con gĂ¬ biáº¿t bay',117),(31,26,'ss',121),(32,27,'ss',125),(33,27,'s',129),(34,28,'ss',133),(35,29,'s',137),(36,30,'ss',141),(37,30,'s',145),(38,31,'tphuong yĂªu ai nháº¥t',149),(39,31,'anh lá»™c thĂ­ch Äƒn gĂ¬ nháº¥t',153),(40,31,'bĂ¡nh nĂ o ngon nháº¥t',157),(41,32,'tphuong yĂªu ai nháº¥t',161),(42,32,'anh lá»™c thĂ­ch Äƒn gĂ¬ nháº¥t',165),(43,32,'bĂ¡nh nĂ o ngon nháº¥t',170),(44,33,'dsd',173),(45,34,'ss',177),(46,35,'The ..... scale of manufacture is so huge, that is the issue. ( quy mĂ´ sáº£n xuáº¥t tuyá»‡t Ä‘á»‘i lĂ  ráº¥t lá»›n, Ä‘Ă³ chĂ­nh lĂ  váº¥n Ä‘á»)',181),(47,36,'The ..... scale of manufacture is so huge, that is the issue. ( quy mĂ´ sáº£n xuáº¥t tuyá»‡t Ä‘á»‘i lĂ  ráº¥t lá»›n, Ä‘Ă³ chĂ­nh lĂ  váº¥n Ä‘á»)',185),(48,37,'má»›i',192),(49,38,'4 chĂ¢n',194),(50,39,'4 chĂ¢n',207),(51,39,'dsd',201),(52,40,'4 chĂ¢n',211),(53,40,'dsd',213),(54,40,'ssss',217),(55,41,'ssssss',221),(56,42,'ssssss',225),(57,42,'thu',229);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(255) NOT NULL DEFAULT 'Untitled Quiz',
  `meaning` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (1,1,'2025-05-12 23:30:30','Untitled Quiz',NULL),(2,1,'2025-05-12 23:31:07','Untitled Quiz',NULL),(3,1,'2025-05-15 07:56:26','Untitled Quiz',NULL),(4,1,'2025-05-16 07:24:42','Untitled Quiz',NULL),(5,1,'2025-05-17 00:28:32','Untitled Quiz',NULL),(6,1,'2025-05-17 00:37:26','Untitled Quiz',NULL),(7,1,'2025-05-17 00:43:29','Untitled Quiz',NULL),(8,1,'2025-05-17 00:43:37','Untitled Quiz',NULL),(9,1,'2025-05-17 00:48:35','Untitled Quiz',NULL),(10,1,'2025-05-17 00:56:06','Untitled Quiz',NULL),(11,1,'2025-05-22 08:18:17','Untitled Quiz',NULL),(12,1,'2025-05-22 08:34:55','Untitled Quiz',NULL),(13,1,'2025-05-22 08:35:55','Untitled Quiz',NULL),(14,1,'2025-05-22 08:38:25','Untitled Quiz',NULL),(15,1,'2025-05-22 08:38:59','Untitled Quiz',NULL),(16,1,'2025-05-22 08:51:58','Untitled Quiz',NULL),(17,1,'2025-05-22 08:54:29','Untitled Quiz',NULL),(18,1,'2025-05-22 08:56:38','Untitled Quiz',NULL),(19,1,'2025-05-22 08:59:55','Untitled Quiz',NULL),(20,1,'2025-05-22 09:00:18','Untitled Quiz',NULL),(21,1,'2025-05-22 09:10:42','Untitled Quiz',NULL),(22,1,'2025-05-22 09:18:34','Untitled Quiz',NULL),(23,1,'2025-05-22 09:22:11','Untitled Quiz',NULL),(24,2,'2025-05-22 09:23:40','Untitled Quiz',NULL),(25,2,'2025-05-22 09:33:24','Untitled Quiz',NULL),(26,2,'2025-05-22 09:37:16','Untitled Quiz',NULL),(27,2,'2025-05-22 09:42:57','Untitled Quiz',NULL),(28,2,'2025-05-22 09:47:16','Untitled Quiz',NULL),(29,2,'2025-05-22 09:48:42','ss',NULL),(30,2,'2025-05-22 09:49:04','sss',NULL),(31,3,'2025-05-22 09:53:09','tĂ¬nh iu to Ä‘Ă¹ng',NULL),(32,3,'2025-05-22 09:53:22','tĂ¬nh iu to Ä‘Ă¹ng',NULL),(33,1,'2025-07-03 08:44:03','ss',NULL),(34,1,'2025-07-03 08:44:27','',NULL),(35,5,'2025-08-30 03:04:45','',NULL),(36,5,'2025-08-30 03:06:56','',NULL),(37,5,'2025-08-30 03:47:37','má»›i',NULL),(38,1,'2025-09-18 03:05:04','con váº­t',NULL),(39,1,'2025-09-18 03:06:43','',NULL),(40,1,'2025-09-29 04:56:51','',NULL),(41,1,'2025-09-29 05:08:24','',NULL),(42,1,'2025-09-29 05:14:38','thu',NULL);
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'s','s','$2b$10$G82bVAoXZuyhQC0Ktvt3vuAGkAElZ0EqNmm3f1aPoi7S8EUZl9ISW'),(2,'ss','ss','$2b$10$jw05x/W1Hv9Ym2Vkbs2oL.iPnb07HG3WCXbx2HtsdvP0KzRjW8SlK'),(3,'zen','tphuong','$2b$10$IQm83.A43Gc0u9QAtWvl0uOItkdBq9pb2Tw88TJqGpaRwBrWWp73S'),(4,'s','a','$2b$10$oRnxk6Cgmbt9.ffYAArAu.SQjGQb23hB5bytWBRJN2NOlm5T2WqT2'),(5,'english','english','$2b$10$IdBZR/JZCoUmDZlp.MUT3uOawrNQwar7AWYDxacs7zd8s90k6zyxS');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-29 12:24:58
