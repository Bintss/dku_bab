⸻

notices 앱 설명
	1.	notices 앱 개요

⸻

	•	식당/서비스 관련 공지사항을 관리하는 앱입니다.
	•	관리자(admin)가 공지를 작성/수정하고,
	•	프론트엔드에서는 DRF API를 통해 공지 목록/상세를 조회할 수 있습니다.

	2.	모델 (models.py)

⸻

클래스: Notice

필드:
	•	title (CharField, max_length=200)
	•	공지 제목
	•	content (TextField)
	•	공지 본문 내용
	•	author (ForeignKey -> settings.AUTH_USER_MODEL)
	•	공지 작성자 (관리자 계정)
	•	on_delete=models.SET_NULL, null=True, blank=True
	•	related_name=“notices”
	•	is_pinned (BooleanField, default=False)
	•	공지 상단 고정 여부
	•	created_at (DateTimeField, auto_now_add=True)
	•	생성 시각
	•	updated_at (DateTimeField, auto_now=True)
	•	수정 시각
	•	is_active (BooleanField, default=True)
	•	공지 활성 여부 (False인 경우 API/화면에서 숨김 용도)

Meta:
	•	ordering = [”-is_pinned”, “-created_at”]
	•	is_pinned=True(상단 고정) 공지들을 우선 정렬
	•	그 다음 created_at 기준 최신순 정렬

str:
	•	str 메서드는 title을 반환하여 admin 등에서 객체를 보기 편하게 함

	3.	관리자 설정 (admin.py)

⸻

클래스: NoticeAdmin (admin.ModelAdmin 상속)

등록:
	•	@admin.register(Notice) 데코레이터를 사용해 Notice 모델과 연결

옵션:
	•	list_display
	•	“id”, “title”, “author”, “is_pinned”, “is_active”, “created_at”
	•	관리자 목록 화면에서 한눈에 공지 상태를 확인할 수 있도록 컬럼 구성
	•	list_filter
	•	“is_pinned”, “is_active”, “created_at”
	•	오른쪽 필터 영역에서 상단 고정 여부, 활성 여부, 생성일로 필터링 가능
	•	search_fields
	•	“title”, “content”, “author__username”
	•	상단 검색창에서 제목, 내용, 작성자 아이디(username)로 검색 가능
	•	ordering
	•	(”-is_pinned”, “-created_at”)
	•	모델 Meta의 ordering과 동일하게 설정하여 admin 목록 정렬 유지
	•	readonly_fields
	•	“created_at”, “updated_at”
	•	생성/수정 시간은 읽기 전용으로 표시 (자동 관리 필드)

	4.	시리얼라이저 (serializers.py)

⸻

클래스: NoticeSerializer (serializers.ModelSerializer 상속)

필드 구성:
	•	기본적으로 Notice 모델 기반
	•	author 필드를 username 문자열로 내려주기 위해 다음과 같이 설정:
author = serializers.CharField(
source=“author.username”,
read_only=True,
)

Meta:
	•	model = Notice
	•	fields = [
“id”,
“title”,
“content”,
“author”,
“is_pinned”,
“is_active”,
“created_at”,
“updated_at”,
]
	•	read_only_fields = [
“id”,
“author”,
“created_at”,
“updated_at”,
]

설명:
	•	author는 실제로는 FK이지만, API 응답에서는 author.username만 문자열로 노출
	•	id, author, created_at, updated_at은 클라이언트에서 수정할 수 없도록 read_only 설정

	5.	뷰 (views.py)

⸻

DRF의 제네릭 뷰를 사용하여 조회 전용 API를 구현했습니다.
	1.	공지 목록 조회 API

클래스: NoticeListAPIView (generics.ListAPIView 상속)
	•	queryset = Notice.objects.filter(is_active=True)
	•	is_active=True인 공지만 목록에 노출
	•	정렬은 모델 Meta.ordering에 따라 is_pinned → created_at 내림차순
	•	serializer_class = NoticeSerializer
	•	NoticeSerializer를 사용해 JSON 응답 생성
	•	지원 HTTP 메서드: GET
	•	공지 리스트 조회 전용

	2.	공지 상세 조회 API

클래스: NoticeDetailAPIView (generics.RetrieveAPIView 상속)
	•	queryset = Notice.objects.filter(is_active=True)
	•	비활성화(is_active=False) 공지는 조회 불가 (404 처리)
	•	serializer_class = NoticeSerializer
	•	lookup_field 기본값은 “pk”를 사용 (URL의 int:pk￼)

	6.	URL 설정 (notices/urls.py)

⸻

app_name = “notices”

urlpatterns:
	•	path(“notices/”, NoticeListAPIView.as_view(), name=“notice-list”)
	•	GET /api/notices/
	•	활성화된 공지 전체 목록 조회
	•	path(“notices/int:pk￼/”, NoticeDetailAPIView.as_view(), name=“notice-detail”)
	•	GET /api/notices//
	•	특정 id의 공지 상세 조회 (is_active=True인 경우만 200, 아니면 404)

프로젝트 전역 URL(cafeteria_project/urls.py)에는 다음이 포함되어 있어야 합니다.
	•	path(“api/”, include(“notices.urls”)),

	7.	테스트 (tests.py)

⸻

테스트 클래스: NoticeAPITestCase (APITestCase 상속)

setUp:
	•	테스트용 유저 생성 (작성자 author 용)
	•	공지 목록 URL reverse(“notices:notice-list”) 준비

테스트 케이스:
	1.	test_get_empty_notice_list

	•	공지가 하나도 없을 때 /api/notices/ 호출
	•	기대 동작:
	•	status_code == 200
	•	response.data == []

	2.	test_get_notice_list_with_pinned_ordering

	•	is_pinned가 다른 공지 3개를 생성:
	•	일반 공지 1 (is_pinned=False)
	•	상단 고정 공지 (is_pinned=True)
	•	일반 공지 2 (is_pinned=False, 더 나중에 생성)
	•	/api/notices/ 호출
	•	기대 동작:
	•	status_code == 200
	•	응답 길이 == 3
	•	첫 번째 공지는 “상단 고정 공지”
	•	나머지 두 개는 created_at 기준 최신 순으로 정렬됨

	3.	test_get_notice_detail_active_only

	•	활성 공지(active_notice, is_active=True)
	•	비활성 공지(inactive_notice, is_active=False)
	•	각각에 대해 /api/notices// 호출
	•	기대 동작:
	•	활성 공지는 status_code == 200, title == “활성 공지”
	•	비활성 공지는 status_code == 404

테스트 실행 방법:
	•	docker compose exec web python manage.py test notices

	8.	요약

⸻

	•	notices 앱은 공지사항 데이터를 관리하고,
	•	관리자(admin)를 통한 CRUD 관리
	•	DRF API를 통한 공지 목록/상세 조회 기능을 제공합니다.
	•	정렬/필터/검색/상태(is_active, is_pinned) 등 운영에 필요한 기능을 기본적으로 지원하며,
	•	tests.py를 통해 공지 API의 기본 동작을 자동으로 검증할 수 있습니다.

⸻