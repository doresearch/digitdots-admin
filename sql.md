CREATE TABLE IF NOT EXISTS `mydb`.`coupon` (
  `coupon_id` INT NOT NULL,
  `coupon_status` VARCHAR(45) NULL,
  `coupon_stagy` VARCHAR(45) NULL COMMENT '1 - 满减\n2 - 折扣\n',
  `coupon_value` VARCHAR(45) NULL,
  `times` VARCHAR(45) NULL,
  `used_times` VARCHAR(45) NULL,
  PRIMARY KEY (`coupon_id`))
ENGINE = InnoDB
COMMENT = '优惠信息'

CREATE TABLE IF NOT EXISTS `mydb`.`coupon` (
  `coupon_id` INT NOT NULL,
  `coupon_status` VARCHAR(45) NULL,
  `coupon_stagy` VARCHAR(45) NULL COMMENT '1 - 满减\n2 - 折扣\n',
  `coupon_value` VARCHAR(45) NULL,
  `times` VARCHAR(45) NULL,
  `used_times` VARCHAR(45) NULL,
  PRIMARY KEY (`coupon_id`))
ENGINE = InnoDB
COMMENT = '优惠信息'