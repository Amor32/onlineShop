-- -----------------------------------------------------
-- Table `mydb`.`Customer`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `productdb`.`Customer` (
  `ID` INT NOT NULL AUTO_INCREMENT ,
  `Name` TEXT NOT NULL ,
  `PhoneNo` VARCHAR(45) NULL ,
  PRIMARY KEY (`ID`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Order`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `productdb`.`Order` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NULL ,
  `Cost` INT NOT NULL,
  PRIMARY KEY (`ID`) ,
  INDEX `fk_Order_1_idx` (`customer_id` ASC) ,
  CONSTRAINT `fk_Order_1`
    FOREIGN KEY (`customer_id` )
    REFERENCES `productdb`.`Customer` (`ID` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Product`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `productdb`.`Product` (
  `ID` INT NOT NULL ,
  `Name` VARCHAR(45) NOT NULL ,
  `Description` TEXT NULL ,
  PRIMARY KEY (`ID`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`OrderItem`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `productdb`.`OrderItem` (
  `ID` INT NOT NULL ,
  `Order_ID` INT NOT NULL ,
  `Product_ID` INT NOT NULL ,
  `Quantity` INT NOT NULL ,
  PRIMARY KEY (`ID`) ,
  INDEX `fk_OrderItem_1_idx` (`Order_ID` ASC) ,
  INDEX `fk_OrderItem_2_idx` (`Product_ID` ASC) ,
  CONSTRAINT `fk_OrderItem_1`
    FOREIGN KEY (`Order_ID` )
    REFERENCES `productdb`.`Order` (`ID` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_OrderItem_2`
    FOREIGN KEY (`Product_ID` )
    REFERENCES `productdb`.`Product` (`ID` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;