
1단계: 프로젝트 클론 및 .env 파일 설정

.env 파일 생성 :.env.example (템플릿) 파일을 복사하여 .env (실제 설정) 파일을 만듭니다. 이 파일은 민감 정보를 담고 있으므로 Git에 올라가지 않습니다.
.env 파일 수정:VSCode나 메모장으로 방금 생성한 .env 파일을 열고, your_...로 표시된 부분을 팀 리더(DBA)에게 공유받은 공용 개발 DB 정보로 채워 넣습니다.DB_NAME, DB_USER, DB_PASSWORD, DB_ROOT_PASSWORD 등
Django 비밀 키 생성 및 추가:아래 명령어로 Django가 사용할 고유한 비밀 키를 생성합니다.docker-compose run --rm web python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
터미널에 출력된 긴 문자열을 복사하여, .env 파일 맨 아래의 DJANGO_SECRET_KEY= 부분에 붙여넣고 저장합니다.

2단계: Docker 컨테이너 빌드 및 실행
Docker Desktop 실행:Docker Desktop 프로그램을 반드시 먼저 실행시켜 주세요.
도커 이미지 빌드:Dockerfile을 기반으로 Django 앱을 실행할 환경(이미지)을 빌드합니다. (최초 1회 또는 Dockerfile 변경 시 필요)docker-compose build

도커 컨테이너 실행:docker-compose.yml에 정의된 db (MySQL) 서버와 web (Django) 서버를 백그라운드에서 실행합니다.docker-compose up -d

실행 확인:아래 명령어로 컨테이너 상태를 확인합니다. mysql_db와 django_web 두 서비스의 Status가 Up 또는 running으로 표시되면 성공입니다.docker-compose ps

3단계: 데이터베이스 마이그레이션 (테이블 생성)
Django 마이그레이션 실행:DB 서버와 Django 앱이 연결되었는지 최종 확인하는 단계입니다.
Django가 DB에 접속하여 기본 테이블(로그인, 관리자 등)을 생성하도록 명령합니다.
docker-compose run --rm web python manage.py migrate

4단계: Django Admin 페이지 사용
Django가 기본 제공하는 Admin 페이지를 통해 DB의 사용자, 리뷰 등의 모델을 웹 UI로 직접 관리할 수 있습니다.
관리자 계정 생성: docker-compose run --rm web python manage.py createsuperuser
접속: http://127.0.0.1:8000/admin/
위에서 생성한 관리자 계정으로 로그인하면 Admin 페이지가 표시됩니다.

현재 프로젝트는 백엔드 API 개발 단계로, 회원가입/로그인/로그아웃을 위한 프론트엔드 화면은 아직 구현되지 않은 상태입니다. 따라서 해당 기능은 Admin 페이지 또는 Postman을 통해 테스트할 수 있습니다.

CSRF 관련 안내
현재 Postman 테스트를 위해 일부 뷰에 @csrf_exempt가 적용하여 CSRF 검사를 임시로 비활성화했습니다. 실제 서비스 환경에서는 보안을 위해 @csrf_exempt를 제거하고, 프론트엔드에서 CSRF 토큰을 포함해 요청을 보내도록 설정해야 합니다.
