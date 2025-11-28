이슈 #1. 페이지 기능 전체식당 , 별점 순, 리뷰 많은 순 선택하여 식당, 메뉴를 보여줌

현재 백엔드 /api/cafeterias/ 응답에는 식당 목록만 있고 avg_rating이나 review_count는 포함되지 않은 상태. 
따라서, 메인 화면에서는 "전체 식당" 리스트만 API로 불러와 보여주고, 정렬 버튼은 UI상으로만 존재하고 안내 메시지를 띄우는 방식으로 처리하는 한 상태

정렬 기능을 구현하기 위해, 백엔드에서 avg_rating, review_count 필드를 보내준다고 가정하고 (백엔드 개발자 구현) UserPage.jsx 코드를 작성

즉, 백엔드 API를 호출하면서, 정렬 버튼을 클릭했을 때 데이터를 정렬하는 로직을 포함한 UserPage.jsx 구현 해둠

버튼 UI와 기능 자체는 구현되어 있으므로, 나중에 백엔드에서 avg_rating 와 review_count 필드를 추가해주면 즉시 작동

----------------------------------------------------------------------------------------

이슈 #2. 전체 식당에서 식당 카드를 눌렀을 때 (상세보기)를 눌렀을 때 "정보를 불러올 수 없다" 메세지 뜸

--> 현재, src/pages/RestaurantDetailPage.jsx (line 33,34), catch (error) 메세지 출력되는 상태

<RestaurantDetailPage.jsx 구현 기능>
1. 데이터 통합 조회
2. 메뉴목록 상세 표시 및 통계
  - 모든 메뉴 카드형태로 나열
  - 메뉴 옆에는 평점과 리뷰 수 표시

3. 리뷰 보기 기능
  - 메뉴 카드 클릭 시, 리뷰를 보여주는 팝업 창 생성

4. 리뷰 작성 기능
  - 리뷰 작성 버튼 클릭 시, 리뷰 작성 팝업

5. 식당 목록 버튼 누르면 페이지 뒤로가기 


프론트엔드가 /api/cafeterias/1/menus/ (메뉴 목록) API에 요청을 보냈지만, 서버 내부에서 **예상치 못한 Python 코드 오류(500 에러)**가 발생

원인: CafeteriaMenuListAPIView 뷰 안에서 DB 쿼리(특히 평점/리뷰 수 계산 로직)가 실패하거나, 필요한 모델(예: reviews 앱의 Review 모델)을 가져오지 못하고 있기 때문입니다.

404 Not Found (식당 상세):

프론트엔드가 /api/cafeterias/1/ (식당 상세 정보) API에 요청을 보냈지만, 서버가 이 주소를 아예 찾지 못하고 있습니다.

원인: cafeterias/urls.py 파일에 path("cafeterias/<int:pk>/", ...) 주소가 누락되었거나, 이 주소를 처리할 CafeteriaDetailAPIView 클래스가 views.py에 없습니다.

---------------------------------------------------------------------------------------
이슈 #3. 내 정보 버튼 클릭 시 실제 데이터가 뜨도록 백앤드 구현 

현재 내 정보 페이지를 구현해놓은 src : MyPage.jsx

현재 mock데이터로 UI 구현 해 놓음 -> 서버 돌려서 확인할 것.
주석으로 API 호출 버전 구현 해놓음 -> 주석 풀어서 적용 시켜서 돌아가는 지 확인.

<MyPage.jsx.jsx 구현 기능>
1. 유저 정보
2. 내가 쓴 리뷰 목록, 수

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------

<각 파일별 구현 요구사항 요약>

. reviews/serializers.py (데이터 번역)
요구사항: RestaurantSerializer, MenuSerializer, ReviewSerializer, MyReviewSerializer 4가지 Serializer를 정의해야 합니다.

핵심: RestaurantSerializer 내에서 avg_rating과 review_count를 SerializerMethodField 또는 ORMS의 Annotate 기능을 사용하여 계산해야 합니다.

B. reviews/views.py (핵심 로직)
cafeterias_list_view (GET): 모든 식당 데이터를 조회하고 계산된 통계량(avg_rating, review_count)을 붙여서 Serializer로 반환해야 합니다. (@api_view 및 AllowAny 권한 사용)

review_create_view (POST): 리뷰를 저장할 때 request.FILES에서 이미지를 추출하고, request.user를 author로 설정하여 저장하는 로직을 구현해야 합니다.

C. cafeteria_project/settings.py (환경 설정)
INSTALLED_APPS에 'rest_framework', 'corsheaders', 'reviews'가 모두 등록되어 있어야 합니다.

MEDIA_ROOT와 MEDIA_URL을 정의하여 이미지 파일(ImageField) 저장을 위한 환경을 설정해야 합니다.

----------------------------------------------------------------------------------------

<구현 후 테스트>
백엔드 개발자는 코드를 모두 수정한 후, 다음 순서대로 터미널 명령어를 실행 후 테스트

#1. 패키지 설치:
pip install djangorestframework Pillow 

#2. DB 마이그레이션 (테이블 구조 생성):
python manage.py makemigrations 
python manage.py migrate


#3. 서버 실행:
python manage.manage.py runserver 0.0.0.0:8000