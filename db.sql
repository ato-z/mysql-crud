CREATE TABLE `az_book` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cover` int(11) unsigned NOT NULL COMMENT '媒体来源的id',
  `title` varchar(255) NOT NULL COMMENT '房间标题',
  `des` varchar(255) NOT NULL COMMENT '房间简介',
  `author` varchar(255) NOT NULL COMMENT '房间简介',
  `create_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp(),
  `delete_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

CREATE TABLE `az_image` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar(255) NOT NULL COMMENT '房间标题',
  `from` ENUM('1', '2') DEFAULT '1' COMMENT '1为本地, 2为线上服务器',
  `create_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp(),
  `delete_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;