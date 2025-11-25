⸻

cafeterias 앱 설명
	1.	cafeterias 앱 개요

⸻

	•	단국대 식당 정보를 관리하는 앱입니다.
	•	기본적으로 두 가지 주요 모델을 제공합니다:
	1.	Cafeteria (식당)
	2.	Menu (식당별 메뉴)
	•	관리자(admin)는 식당과 메뉴를 생성·관리할 수 있고,
프론트엔드는 DRF API를 이용해서 식당 목록 및 메뉴 목록을 조회할 수 있습니다.

⸻

	2.	모델 (models.py)

⸻

1) Cafeteria 모델

식당 정보를 저장하는 기본 모델

필드:
	•	name (CharField)
식당 이름
	•	description (TextField, optional)
식당 설명
	•	location (CharField)
위치 정보 (건물명, 캠퍼스명 등)
	•	is_active (BooleanField, default=True)
식당 활성 여부 (비활성 시 API 목록에서 제외)
	•	created_at / updated_at
자동 생성/수정 시간

메타 정보:
	•	ordering = ["name"]
	•	식당 목록은 이름 기준 오름차순 정렬

__str__:
	•	식당 이름을 반환 (admin 리스트에서 식별 용도)

⸻

2) Menu 모델

각 식당(Cafeteria)에 속하는 메뉴 정보

필드:
	•	cafeteria (ForeignKey)
식당과 1:N 관계
on_delete=models.CASCADE
	•	name (CharField)
메뉴 이름
	•	price (IntegerField)
가격
	•	description (TextField, optional)
메뉴 설명
	•	is_sold_out (BooleanField, default=False)
품절 여부
	•	is_active (BooleanField, default=True)
메뉴 비활성 여부
	•	created_at / updated_at
자동 생성/수정 시간

메타 정보:
	•	ordering = ["name"]

__str__:
	•	메뉴 이름 반환

⸻

	3.	관리자 설정 (admin.py)

⸻

CafeteriaAdmin

list_display:
	•	“id”, “name”, “location”, “is_active”, “created_at”

list_filter:
	•	“is_active”, “created_at”

search_fields:
	•	“name”, “location”

ordering:
	•	(“name”,)

MenuAdmin

list_display:
	•	“id”, “name”, “cafeteria”, “price”, “is_sold_out”, “is_active”

list_filter:
	•	“cafeteria”, “is_sold_out”, “is_active”

search_fields:
	•	“name”, “cafeteria__name”

ordering:
	•	(“name”,)

⸻

	4.	시리얼라이저 (serializers.py)

⸻

1) CafeteriaSerializer

class CafeteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafeteria
        fields = ["id", "name", "description", "location", "is_active"]

2) MenuSerializer

메뉴 serializer 안에 cafeteria 정보도 포함:

class MenuSerializer(serializers.ModelSerializer):
    cafeteria = CafeteriaSerializer(read_only=True)

    class Meta:
        model = Menu
        fields = [
            "id",
            "cafeteria",
            "name",
            "price",
            "description",
            "is_sold_out",
            "is_active",
        ]


⸻

	5.	뷰 (views.py)

⸻

1) CafeteriaListAPIView

모든 활성화된 식당을 조회하는 API
	•	클래스: generics.ListAPIView
	•	queryset = Cafeteria.objects.filter(is_active=True)
	•	serializer_class = CafeteriaSerializer
	•	지원 메서드: GET

URL 예시:

GET /api/cafeterias/


⸻

2) CafeteriaMenuListAPIView

특정 식당의 활성화된 메뉴만 조회
	•	클래스: generics.ListAPIView
	•	serializer_class = MenuSerializer
	•	queryset은 get_queryset에서 cafeteria_id 기반 필터링

def get_queryset(self):
    cafeteria_id = self.kwargs["cafeteria_id"]
    return Menu.objects.filter(cafeteria_id=cafeteria_id, is_active=True)



URL 예시:

GET /api/cafeterias/1/menus/


⸻

	6.	URL 설정 (cafeterias/urls.py)

⸻


from django.urls import path
from .views import CafeteriaListAPIView, CafeteriaMenuListAPIView

app_name = "cafeterias"

urlpatterns = [
    path("cafeterias/", CafeteriaListAPIView.as_view(), name="cafeteria-list"),
    path(
        "cafeterias/<int:cafeteria_id>/menus/",
        CafeteriaMenuListAPIView.as_view(),
        name="cafeteria-menu-list",
    ),
]

프로젝트 전역 URL(cafeteria_project/urls.py) 설정:

path("api/", include("cafeterias.urls")),


⸻

	7.	테스트 (tests.py)

⸻

테스트 클래스: CafeteriaAPITestCase

테스트 항목:

1) 공백 목록 테스트
	•	식당이 없을 때 GET /api/cafeterias/
→ [] 반환

2) 식당 생성 후 조회 테스트
	•	활성 식당 2개 생성
	•	GET /api/cafeterias/
→ name 오름차순 정렬 확인

3) 특정 식당 메뉴 조회 테스트
	•	cafeteria=1 메뉴 2개 생성
	•	cafeteria=2 메뉴 1개 생성
	•	GET /api/cafeterias/1/menus/
→ cafeteria_id=1 메뉴만 반환됨 확인

테스트 실행:

docker compose exec web python manage.py test cafeterias


⸻

	8.	요약

⸻

	•	cafeterias 앱은 식당과 메뉴 데이터 관리를 담당합니다.
	•	관리자(admin)를 통해 CRUD 관리가 가능하고,
	•	DRF API를 통해 목록/상세 데이터를 프론트엔드로 제공할 수 있습니다.
	•	테스트 코드로 기본 API가 정상 동작하는지 지속적으로 검증할 수 있습니다.

⸻