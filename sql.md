CREATE TABLE IF NOT EXISTS `mydb`.`coupon` (
  `coupon_id` INT NOT NULL,
  `coupon_status` VARCHAR(45) NULL,
  `coupon_stagy` VARCHAR(45) NULL COMMENT '1 - 满减\n2 - 折扣\n',
  `coupon_value` VARCHAR(45) NULL,
  `status` Int(2) COMMONT '0-删除，1-有效',
  `times` VARCHAR(13) NULL,
  `used_times` VARCHAR(45) NULL,
  PRIMARY KEY (`coupon_id`))
ENGINE = InnoDB
COMMENT = '优惠信息'

CREATE TABLE IF NOT EXISTS `mydb`.`user` (
  `uid` INT NOT NULL,
  `role` VARCHAR(45) NULL COMMENT '1-admin 2-老师 3-学生',
  `account` VARCHAR(45) NULL,
  `passowrd` VARCHAR(45) NULL COMMENT 'base64',
  `fname` VARCHAR(45) NULL,
  `lname` VARCHAR(45) NULL,
  `address` VARCHAR(45) NULL,
  `invite_code` VARCHAR(32) NULL,
  `status` Int(2) COMMONT '0-删除，1-有效',
  `ctime` VARCHAR(13) NULL,
  `mtime` VARCHAR(13) NULL,
  PRIMARY KEY (`uid`))
ENGINE = InnoDB
COMMENT = '用户信息'

CREATE TABLE IF NOT EXISTS `mydb`.`meeting` (
  `meeting_id` INT NOT NULL,
  `order_time` VARCHAR(13) NULL,
  `lark_url` VARCHAR(13) NULL,
  `teacher_id` VARCHAR(13) NULL,
  `price` VARCHAR(13) NULL,
  `status` Int(2) COMMONT '0-删除，1-有效',
  `ctime` VARCHAR(13) NULL,
  `mtime` VARCHAR(13) NULL,
  PRIMARY KEY (`meeting_id`))
ENGINE = InnoDB
COMMENT = '商品信息'

CREATE TABLE IF NOT EXISTS `mydb`.`order` (
  `order_id` INT NOT NULL,
  <!-- 申诉：申诉理由很多中，取消订单，记录退款 -->
  `order_status` INT(2) COMMONT '0 - 锁单（5min） 1000 - 下单（锁15min） 2000 - 支付完成  2001-支付成功 2002-支付失败 3000 - 交易完成 3001-交易成功 3002-交易失败',
  `push_status` INT(2) COMMONT '0 - 未push，1-已push',
  `seller_uid` VARCHAR(13) NULL,
  `buyer_uid` VARCHAR(13) NULL,
  `status` Int(2) COMMONT '0-删除，1-有效',
  `ctime` VARCHAR(13) NULL,
  `mtime` VARCHAR(13) NULL,
  PRIMARY KEY (`meeting_id`))
ENGINE = InnoDB
COMMENT = '商品信息'

CREATE TABLE IF NOT EXISTS `mydb`.`order` (
  `order_id` INT NOT NULL,
  `order_status` Int(2) COMMONT '订单状态',
  `order_id` Int(2) COMMONT '订单id',
  `order_text` text,
  `status` Int(2) COMMONT '0-删除，1-有效',
  `ctime` VARCHAR(13) NULL,
  `mtime` VARCHAR(13) NULL,
  PRIMARY KEY (`meeting_id`))
ENGINE = InnoDB
COMMENT = '商品信息'