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

##### reviews/serializers.py 파일 생성 #####
-Django 모델을 API 명세에 정의된 JSON 구조로 변환하는 로직을 담당. 
avg_rating, review_count와 같은 계산 필드를 처리