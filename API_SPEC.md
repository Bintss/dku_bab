<<<<<<< HEAD
⸻

DKU 학생식당 리뷰 서비스 API 명세서

Base URL: http://localhost:8000/
모든 API 응답은 application/json 형식입니다.

⸻

1. Cafeterias (식당) / Menus (메뉴)

1-1. 식당 목록 조회 + 검색

GET /api/cafeterias/
	•	기능
	•	활성화된 식당 목록 조회
	•	q 파라미터로 이름/위치 부분 검색
	•	Query Parameters

이름	타입	필수	설명
q	string	✕	식당 이름 또는 위치에 포함되는 키워드

	•	Response 예시

[
  {
    "id": 1,
    "name": "광뚝",
    "location": "1947_commons"
  },
  {
    "id": 2,
    "name": "학생식당",
    "location": "창학관 2층"
  }
]


⸻

1-2. 특정 식당의 메뉴 목록 조회 (+ 평균 평점 / 리뷰 수)

GET /api/cafeterias/{cafeteria_id}/menus/
	•	기능
	•	특정 식당에 속한 메뉴 목록 조회
	•	각 메뉴에 대해 평균 평점(avg_rating), 리뷰 개수(review_count) 포함
	•	order_by로 정렬
	•	Path Parameters

이름	타입	설명
cafeteria_id	int	식당 ID

	•	Query Parameters

이름	타입	필수	설명
order_by	string	✕	rating → 평점 내림차순, 기본값 = 최신 등록순

	•	Response 예시

[
  {
    "id": 5,
    "name": "광뚝사골칼국수",
    "price": 5900,
    "is_sold_out": false,
    "avg_rating": 3.5,
    "review_count": 2
  },
  {
    "id": 6,
    "name": "광뚝김치볶음밥",
    "price": 6200,
    "is_sold_out": false,
    "avg_rating": 4.2,
    "review_count": 10
  }
]


⸻

1-3. 메뉴 검색

GET /api/menus/search/
	•	기능
	•	메뉴 이름, 설명, 식당 이름을 기준으로 키워드 검색
	•	Query Parameters

이름	타입	필수	설명
q	string	✔	메뉴/식당 이름에 포함될 키워드

	•	Response 예시

[
  {
    "id": 5,
    "name": "광뚝사골칼국수",
    "price": 5900,
    "cafeteria": {
      "id": 1,
      "name": "광뚝",
      "location": "1947_commons"
    }
  }
]


⸻

1-4. 인기 메뉴 조회

GET /api/menus/popular/
	•	기능
	•	리뷰 수 / 평균 평점을 기준으로 인기 메뉴 상위 N개 조회
	•	기본 정렬: review_count 내림차순 → avg_rating 내림차순
	•	Query Parameters

이름	타입	필수	설명
limit	int	✕	가져올 메뉴 개수 (기본: 5)

	•	Response 예시

[
  {
    "id": 6,
    "name": "광뚝김치볶음밥",
    "price": 6200,
    "avg_rating": 4.2,
    "review_count": 10,
    "cafeteria": {
      "id": 1,
      "name": "광뚝",
      "location": "1947_commons"
    }
  },
  {
    "id": 5,
    "name": "광뚝사골칼국수",
    "price": 5900,
    "avg_rating": 3.5,
    "review_count": 2,
    "cafeteria": {
      "id": 1,
      "name": "광뚝",
      "location": "1947_commons"
    }
  }
]


⸻

2. Reviews (리뷰)

2-1. 메뉴별 리뷰 목록 조회 / 리뷰 작성

Endpoint
	•	GET /api/menus/{menu_id}/reviews/
	•	POST /api/menus/{menu_id}/reviews/

⸻

(1) GET: 메뉴별 리뷰 목록 조회
	•	기능
	•	특정 메뉴에 대한 리뷰 목록 조회
	•	정렬 옵션 지원: 최신순 / 별점순
	•	Path Parameters

이름	타입	설명
menu_id	int	메뉴 ID

	•	Query Parameters

이름	타입	필수	설명
order	string	✕	latest(기본값), rating(별점 내림차순)

	•	Response 예시

[
  {
    "id": 3,
    "menu": {
      "id": 5,
      "name": "광뚝사골칼국수",
      "price": 5900,
      "cafeteria": {
        "id": 1,
        "name": "광뚝",
        "location": "1947_commons"
      }
    },
    "rating": 3.0,
    "content": "라면이랑 동급",
    "image": "http://localhost:8000/media/review_images/IMG_7410.jpeg",
    "author_username": "root",
    "created_at": "2025-11-19T10:00:35.298345+09:00",
    "updated_at": "2025-11-19T10:00:35.298365+09:00"
  }
]


⸻

(2) POST: 리뷰 작성
	•	기능
	•	특정 메뉴에 대한 리뷰 1개 작성
	•	현재 버전에서는 로그인 연동 전이라, 임시로 기본 User 또는 테스트용 User로 저장하도록 구현됨
	•	Path Parameters

이름	타입	설명
menu_id	int	메뉴 ID

	•	Request Body

Content-Type: multipart/form-data (이미지 업로드 시)
또는 application/json (이미지 없이 텍스트만 보낼 때)

필드명	타입	필수	설명
rating	number	✔	별점 (1 ~ 5, 소수점 허용 X/테이블은 선택지로 제한)
content	string	✕	리뷰 내용 텍스트
image	file	✕	리뷰 사진 (jpeg, png 등)

	•	Request 예시 (JSON, 이미지 없이)

{
  "rating": 4,
  "content": "국물이 진해서 좋았어요."
}

	•	Response 예시 (201 Created)

{
  "id": 4,
  "menu": {
    "id": 5,
    "name": "광뚝사골칼국수",
    "price": 5900,
    "cafeteria": {
      "id": 1,
      "name": "광뚝",
      "location": "1947_commons"
    }
  },
  "rating": 4.0,
  "content": "국물이 진해서 좋았어요.",
  "image": null,
  "author_username": "root",
  "created_at": "2025-11-19T10:10:00.000000+09:00",
  "updated_at": "2025-11-19T10:10:00.000000+09:00"
}


⸻

3. Notices (공지사항)

3-1. 공지 목록 조회 / 공지 등록

Endpoint
	•	GET /api/notices/
	•	POST /api/notices/ (관리자용)

⸻

(1) GET: 공지 목록 조회
	•	기능
	•	전체 공지사항 목록 조회 (최신순 정렬)
	•	q로 제목/내용 검색 지원 (구현한 내용 기준)
	•	Query Parameters

이름	타입	필수	설명
q	string	✕	제목 또는 내용 키워드 검색

	•	Response 예시

[
  {
    "id": 1,
    "title": "광뚝 영업 시간 변경 안내",
    "content": "중간고사 기간 동안 21시까지 연장 영업합니다.",
    "created_at": "2025-11-18T12:00:00+09:00",
    "updated_at": "2025-11-18T12:00:00+09:00"
  }
]


⸻

(2) POST: 공지 등록
	•	기능
	•	관리자 페이지 또는 API 클라이언트로 공지 생성
	•	실서비스 기준으로는 인증/권한 체크가 필요하지만, 과제 범위에서는 생략 가능
	•	Request Body 예시

{
  "title": "11월 20일 광뚝 휴무 안내",
  "content": "시설 점검으로 11월 20일 하루 휴무입니다."
}

	•	Response 예시 (201 Created)

{
  "id": 2,
  "title": "11월 20일 광뚝 휴무 안내",
  "content": "시설 점검으로 11월 20일 하루 휴무입니다.",
  "created_at": "2025-11-19T11:00:00+09:00",
  "updated_at": "2025-11-19T11:00:00+09:00"
}


⸻

4. 이미지 업로드 관련 참고
	•	리뷰 이미지 필드

image = models.ImageField(
    upload_to="review_images/",
    null=True,
    blank=True,
)

	•	settings.py 예시

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

	•	cafeteria_project/urls.py 예시

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... 기존 URL들 ...
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

	•	결과적으로, 업로드된 파일은
http://localhost:8000/media/review_images/파일명 으로 접근 가능함.

⸻

5. 테스트 실행 방법 정리
	•	전체 앱 테스트 실행

docker compose exec web python manage.py test

	•	특정 앱만 테스트

docker compose exec web python manage.py test cafeterias
docker compose exec web python manage.py test reviews
docker compose exec web python manage.py test notices


⸻
=======
# 📢 API 명세서 (DKU BAB Project - Frontend Contract)

본 문서는 프론트엔드(React)가 요구하는 데이터 규격을 정의하며, 백엔드 개발자(Django)는 이 규격에 맞춰 엔드포인트를 구현해야 합니다.

## I. 핵심 데이터 조회 API (GET)

### 1. 식당 목록 및 검색 데이터 (Main Feed / UserPage)

| 항목 | 상세 내용 |
| :--- | :--- |
| **URL** | **GET** `/api/cafeteria/` |
| **인증** | 필요 없음 (AllowAny) |
| **목적** | 메인 화면의 카드 목록 표시 및 정렬/검색 원본 데이터 제공. |

#### 기대 응답 JSON (List of Cafeterias)

```json
{
  "cafeterias": [
    {
      "id": 1,
      "식당이름": "학생회관 식당",      // 💡 [필수!] 프론트엔드 Display Name
      "operating_hours": "09:00 - 18:00",
      "avg_rating": 4.5,            // 💡 [필수!] 별점순 정렬용 (Float)
      "review_count": 123,          // 💡 [필수!] 리뷰순 정렬용 (Int)
      "menus": [                    // 대표 메뉴 표시를 위해 필요
        { 
          "id": 101, 
          "name": "등심 돈까스",     
          "price": 6500 
        }
      ]
    }
  ]
}

##### reviews/serializers.py 파일 수정 #####
-Django 모델을 API 명세에 정의된 JSON 구조로 변환하는 로직을 담당. 
avg_rating, review_count와 같은 계산 필드를 처리
>>>>>>> 479744b (feat(frontend): Implement user page and define initial API contract)
