<?php
header('Content-Type:application/json;charset=tf-8');

$conn=mysqli_connect('127.0.0.1','root','','myplayer','3306');
$sql="set names utf8";
mysqli_query($conn,$sql);
$sql="select count(*) from musicList";
$result=mysqli_query($conn,$sql);

$musicList=[];
while(($row=mysqli_fetch_assoc($result))!==null){
	$musicList=["num" => $row['count(*)']];
};

echo json_encode($musicList);