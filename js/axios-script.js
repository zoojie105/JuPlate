/*
1. 지도 생성 & 확대 축소 컨트롤러 
https://apis.map.kakao.com/web/sample/addMapControl/
*/
var container = document.getElementById('map');
var options = {
	center: new kakao.maps.LatLng(37.4014,127.1086),
	level: 4
};

var map = new kakao.maps.Map(container, options);

// 지도 확대 축소를 제어할 수 있는 줌 컨트롤 생성
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);


/* 2. 데이터 요청  (제목, 주소, url, 카테고리)*/
async function getDataSet(category) {
	let qs = category;
	if (!qs) {
		qs = "";
	}

	const dataSet = await axios ({
        method: "GET",
        url: `http://43.200.39.179:3000/restaurants?category=${qs}`,
        headers: {}, // packet header
        data: {}, // packet body
	});

	// console.log(dataSet);
	return dataSet.data.result;
}


/*
3. 여러개 마커 찍기
https://apis.map.kakao.com/web/sample/multipleMarkerImage/
* 주소 - 좌표 변환
https://apis.map.kakao.com/web/sample/addr2coord/ (주소로 장소 표시하기)

*/

// 주소-좌표 변환 객체를 생성
var geocoder = new kakao.maps.services.Geocoder();

//주소-좌표 변환 함수
function getCoordsByAddress(address){
	return new Promise((resolve,reject) => {
		// 주소로 좌표를 검색
		geocoder.addressSearch(address, function(result, status) {
			if (status === kakao.maps.services.Status.OK) {
				var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
				resolve(coords);
				return;
			} 
			reject(new Error("getCoordsByAddress Error: not vaild Address"))
		});    
	});
}

async function setting() {
	try {
		const dataSet = await getDataSet();
		setMap(dataSet);
	} catch (error) {
		console.error(error);
	}
}

setting();

/* 
4. 마커에 인포윈도우 붙이기
  * 마커에 클릭 이벤트로 인포윈도우 https://apis.map.kakao.com/web/sample/multipleMarkerEvent/
  * url에서 섬네일 따기
  * 클릭한 마커로 지도 센터 이동 https://apis.map.kakao.com/web/sample/moveMap/
*/

function getContent(data) {
	let imgUrl = data.img;
	imgUrl = "/images/"+imgUrl;

	//인포윈도우 가공하기
	return `
	<div class="infowindow">
		<div class="infowindow-img-container">
			<img src="${imgUrl}" alt="" class="infowindow-img">
		</div>
		<div class="infowindow-body">
			<h5 class="infowindow-title">${data.title}</h5>
			<p class="infowindow-address">${data.address} ${data.address2}</p>
		</div>
	</div>
`
}


async function setMap(dataSet){
	for (var i = 0; i < dataSet.length; i ++) {
		// 마커 생성
		let coords = await getCoordsByAddress(dataSet[i].address);
		var marker = new kakao.maps.Marker({
			map: map, // 마커를 표시할 지도
			position: coords, // 마커를 표시할 위치
		});	

		markerArray.push(marker);
		
		// 마커에 표시할 인포윈도우 생성
		var infowindow = new kakao.maps.InfoWindow({
			content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
		});
	
		infowindowArray.push(infowindow)

		// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록
		// 이벤트 리스너로는 클로저를 만들어 등록
		// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트 등록
		kakao.maps.event.addListener(
			marker, 
			'click', 
			makeOverListener(map, marker, infowindow,coords)
		);
		kakao.maps.event.addListener(
			map, 
			'click', 
			makeOutListener(infowindow)
		);
	}
}

// 인포윈도우를 표시하는 클로저를 만드는 함수

function makeOverListener(map, marker, infowindow,coords) {
    return function() {
		//1. 클릭시 다른 인포윈도우 닫기
		closeInfowindow();
        infowindow.open(map, marker);
		//2. 클릭한 곳으로 지도 중심 옮기기	
    	map.panTo(coords);

    };
}

let infowindowArray = [];
function closeInfowindow() {
	for (let infowindow of infowindowArray) {
		infowindow.close();
	}
};

// 인포윈도우를 닫는 클로저를 만드는 함수
function makeOutListener(infowindow) {
    return function() {
        infowindow.close();
    };
}

/* 카테고리 분류 */

// 카테고리
const categoryMap = {
	korea: "한식",
	china: "중식",
	japan: "일식",
	western_food: "양식",
	street_food: "분식",
	roast: "구이",
	sushi: "회/초밥",
	etc: "기타",
  };
  
  const categoryList = document.querySelector(".category-list");
  categoryList.addEventListener("click",categoryHandler);

  async function categoryHandler(event) {
	const categoryId = event.target.id;
	const category = categoryMap[categoryId];

	try {
		//데이터 분류
		let categorizedDataSet = await getDataSet(category);
	
		// 기존 마커 삭제
		closeMarker();
		// 기존 인포윈도우 닫기
		closeInfowindow();
		// 실행
		setMap(categorizedDataSet);
	} catch (error) {
		console.error(error);
	}

  }

// 기존 마커 삭제 함수
markerArray = [];
function closeMarker() {
  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }
}