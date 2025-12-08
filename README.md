## 사용자 가이드
### 서비스 소개
DKU BAB은 단국대학교 학생식당 메뉴 정보를 제공하고, 학생들이 직접 리뷰를 작성·확인할 수 있는 서비스입니다.
### 제공 기능
회원가입 / 로그인
식당 목록 및 메뉴 정보 조회
리뷰 작성(별점 + 텍스트 + 이미지)
공지사항 확인
### 사용 방법
회원가입 후 로그인합니다.
식당을 선택하여 메뉴 목록을 확인합니다.
메뉴 상세 페이지에서 리뷰를 등록하거나 다른 사용자의 리뷰를 볼 수 있습니다.
공지사항 메뉴에서 운영 알림을 확인할 수 있습니다.

## 개발자 가이드
### 기술 스택
Frontend: React, Vite
Backend: Django, Django REST Framework
Database: MySQL 8
Infra: Docker Compose

### 설계 내용
#### 아키텍처
React 기반 SPA
Django REST Framework 기반 REST API 서버
Axios를 통한 클라이언트–서버 통신
#### 데이터 구조
Django ORM 활용
식당 → 메뉴 → 리뷰 계층 구조(Foreign Key 관계)
이미지 업로드를 고려한 Review 모델 설계(ImageField)
#### UI 설계
화면 단위를 컴포넌트로 분리
react-router-dom을 활용한 페이지 이동 구조
#### 실행 환경 설계
Docker Compose 기반 컨테이너 환경
MySQL Volume 사용하여 데이터 지속성 확보

### 구현 내용
#### 프론트엔드
React 기반 UI 컴포넌트 구현
식당/메뉴/리뷰/공지 화면 구성
Axios로 CRUD API 연동
#### 백엔드
DRF로 RESTful API 구현
Django Auth 기반 로그인/로그아웃
Django Admin으로 운영 데이터 관리
DB 및 인프라
AWS RDS 기반 MySQL 데이터베이스 운영
데이터베이스는 Django ORM을 통해 관리 (migration 사용)
docker-compose로 Django 서버 실행 및 인프라 통합 관리

### 실행 방법 
환경 변수 설정
.env.example 참고하여 .env 생성
cp .env.example .env
백엔드 실행에 필요한 설정 포함
Docker 환경 실행
컨테이너 이미지 빌드
docker-compose build
docker compose로 Django 백엔드 서버 컨테이너 실행
docker-compose up -d
DB 마이그레이션
docker-compose run --rm web python manage.py migrate
관리자 계정 생성 (최초 1회)
docker-compose run --rm web python manage.py createsuperuser
백엔드 접속 테스트
Admin: http://127.0.0.1:8000/admin
프론트엔드 실행
cd frontend
npm install  	# 최초 1회만 실행
npm run dev
접속: http://127.0.0.1:5173
