Reviews API 기능 요약

Reviews 앱은 특정 메뉴에 대한 리뷰를 조회하고 작성하는 기능을 제공합니다.
리뷰는 Django User 모델을 author로 사용하며, menu_id는 URL 경로에서 받습니다.

⸻

1. 모델 구조 (models.py)

리뷰는 다음과 같은 필드를 가집니다.
	•	menu: Menu 모델의 FK
	•	author: User 모델의 FK
	•	rating: 별점(1~5 정수)
	•	content: 리뷰 내용
	•	created_at: 생성 시간
	•	updated_at: 수정 시간

⸻

2. Serializer 구조 (serializers.py)

(1) MenuSimpleSerializer
	•	리뷰 안에서 메뉴 정보를 간단히 보여주기 위한 serializer
	•	메뉴 이름, 가격, 소속 식당(간략 정보)까지 포함

(2) ReviewSerializer
	•	리뷰의 전체 정보 표현
	•	응답 시: 메뉴 정보 + 작성자 username + 리뷰 전체 데이터
	•	요청 시: rating, content 만 받음
	•	menu_id는 URL에서 받아서 perform_create에서 직접 설정하므로
menu_id 필드는 required=False 처리

⸻

3. View 구조 (views.py)

(1) MenuReviewListCreateAPIView
	•	특정 메뉴의 리뷰 목록을 조회하거나 새 리뷰를 생성하는 View

GET
	•	/api/menus/<menu_id>/reviews/
	•	해당 메뉴의 전체 리뷰를 created_at 기준으로 최신순 정렬

POST
	•	/api/menus/<menu_id>/reviews/
	•	요청 본문 예시

{
  "rating": 5,
  "content": "맛있어요!"
}


	•	author는 인증된 사용자로 자동 설정
	•	menu는 URL의 <menu_id>로 자동 설정

⸻

4. URL 구조 (urls.py)

Reviews 앱에서 제공하는 엔드포인트:
	•	GET / POST
/api/menus/<menu_id>/reviews/

⸻

5. 테스트 코드 (tests.py)

작성된 테스트는 다음 세 가지 시나리오를 검증합니다.
	1.	리뷰가 없을 때 GET 요청하면 빈 리스트가 나오는지
	2.	POST 요청으로 리뷰를 정상적으로 생성할 수 있는지
	3.	리뷰 생성 후 GET 요청하면 리스트 안에 리뷰가 포함되는지

테스트 실행 명령어:

docker compose exec web python manage.py test reviews

테스트 실행 시 Django는 테스트 전용 DB를 자동 생성하고 테스트 완료 후 삭제합니다.

⸻

6. 동작 흐름 요약
	1.	클라이언트가 /api/menus/<menu_id>/reviews/ 주소로 접근
	2.	GET: 해당 메뉴 리뷰 리스트 응답
	3.	POST:
	•	로그인 된 유저가 author로 자동 설정
	•	URL의 menu_id를 기반으로 review가 생성
	4.	ReviewSerializer를 통해 메뉴 정보 + 작성자 이름 + 리뷰 내용이 JSON 형태로 응답됨

⸻

필요하면 다음도 만들어줄 수 있어
	•	reviews만 따로 README.md 파일로 바로 생성
	•	API Response 예시 추가
	•	ERD 다이어그램 추가
	•	프론트 팀용 문서 형태로 변환