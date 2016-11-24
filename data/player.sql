set names utf8;
drop database if exists myplayer;
create database myplayer charset=utf8;
use myplayer;

#user
create table user (
  uid int primary key auto_increment,
  uname varchar(32),
  upwd varchar(32),
  sex int(8),
  tel varchar(16),
  email varchar(32),
  head varchar(64)
);
insert into user values (null,'HelloWu','123456','1','15018444321','499906898@qq.com','head/hd001.jpg');
insert into user values (null,'MissLi','654321','0','13800138000','','');

#musiclist list
create table musiclist(
  mid int primary key auto_increment,
  mname varchar(64),
  sid varchar(32),
  album varchar(32),
  url varchar(64),
  style int(8)
);
insert into musiclist values
  (null,'Trouble Is A Friend','1','','music/Lenka - Trouble Is A Friend.mp3',0),
  (null,'愚人的国度','2','','music/孙燕姿 - 愚人的国度.mp3',0),
  (null,'天黑黑','2','','music/孙燕姿 - 天黑黑.mp3',0),
  (null,'一个像夏天一个像秋天','3','','music/范玮琪 - 一个像夏天一个像秋天.mp3',0),
  (null,'K歌之王','4','','music/陈奕迅 - K歌之王.mp3',0),
  (null,'遇见','2','','music/孙燕姿 - 遇见.mp3',0);

#歌单列表
create table sheetlist (
  sheetid int primary key auto_increment,
  sheetname varchar(32),
  uid int(8)
);
insert into sheetlist values (null,'默认列表',0);
insert into sheetlist values (null,'默认列表',1);
insert into sheetlist values (null,'我喜欢',1);

#like list
create table  songsheet (
  lid int primary key auto_increment,
  sheetid int(8),
  mid int(8)
);

insert into songsheet values (null,1,1);
insert into songsheet values (null,1,2);
insert into songsheet values (null,1,3);
insert into songsheet values (null,1,4);
insert into songsheet values (null,1,5);
insert into songsheet values (null,1,6);
insert into songsheet values (null,2,3);
insert into songsheet values (null,2,2);

#singer
create table singer (
  sid int primary key auto_increment,
  sname varchar(32),
  spic varchar(32)
);
insert into singer values (null,'Lenka','img/star/Lenka.jpg'),
  (null,'孙燕姿',''),
  (null,'范玮琪',''),
  (null,'陈奕迅','');

#singer pic
create table singerpic (
  picid int primary key auto_increment,
  picurl varchar(64),
  sid int(8)
);
insert into singerpic values (null,'img/star/bg/syz001.jpg',2);
insert into singerpic values (null,'img/star/bg/syz002.jpg',2);
insert into singerpic values (null,'img/star/bg/syz003.jpg',2);
insert into singerpic values (null,'img/star/bg/Lenka001.jpg',1);
insert into singerpic values (null,'img/star/bg/Lenka002.jpg',1);
insert into singerpic values (null,'img/star/bg/Lenka003.jpg',1);
