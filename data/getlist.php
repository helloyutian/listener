<?php
// header('Content-Type:application/json;charset=UTF-8');
$listName = $_REQUEST['list'];
@$uid = $_REQUEST['uid'] | 0;

$conn=mysqli_connect('127.0.0.1','root','','myplayer','3306');
$sql="set names utf8";
mysqli_query($conn,$sql);

$sql = "SELECT sheetid FROM sheetlist WHERE uid = '$uid' AND sheetname = '$listName'";
$result = mysqli_query($conn,$sql);
$row = mysqli_fetch_assoc($result);
$sheetid = $row['sheetid'];

$sql = "SELECT mid FROM songsheet WHERE sheetid = '$sheetid'";
$result = mysqli_query($conn,$sql);
$songs = [];
while($rowList = mysqli_fetch_assoc($result)){
	$mid = $rowList['mid'];
	$sql = "SELECT * FROM musiclist WHERE mid = '$mid'";
	$resultList = mysqli_query($conn,$sql);
	while($rowMusic = mysqli_fetch_assoc($resultList)){
		$album = ['id' => "", 'name' => $rowMusic['album']];
		$sid = $rowMusic['sid'];
		$sql = "SELECT picurl FROM singerpic WHERE sid = '$sid'";
		$SingerPic = mysqli_query($conn,$sql);
		$bgUrl = [];
		while ($rowPic = mysqli_fetch_assoc($SingerPic)) {
			$bgUrl[] = $rowPic['picurl'];
		}
		$sql = "SELECT * FROM singer WHERE sid = '$sid'";
		$resultSinger = mysqli_query($conn,$sql);
		$artists = [];
		while($rowSinger = mysqli_fetch_assoc($resultSinger)){
			$artists[] = ['id' => $rowSinger['sid'], 'name' => $rowSinger['sname'], 'picUrl' => $rowSinger['spic'], 'bgUrl' => $bgUrl];
		}

		$songs[] = [
			'id' => $rowMusic['mid'],
			'name' => $rowMusic['mname'],
			'artists' => $artists,
			'album' => $album,
			'audio' => $rowMusic['url'],
			'djProgramId' => $rowMusic['style']
		];
	}

}

$rst = ['songCount' => count($songs,0), 'songs' => $songs];
$output = ['result' => $rst, 'code' => 200];

// $sql="SELECT musiclist.mid, musiclist.mname,singer.sname FROM `musiclist`,`singer`,`sheetlist`,`songsheet` WHERE sheetlist.sheetid = songsheet.sheetid AND songsheet.mid = musiclist.mid AND musiclist.sid = singer.sid AND sheetlist.uid = '$uid' AND sheetlist.sheetname = '$listName'";
// $result=mysqli_query($conn,$sql);

// $rst = MYSQLI_FETCH_ALL($result,MYSQLI_ASSOC);
echo json_encode($output);