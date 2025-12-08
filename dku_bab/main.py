import sql_query as sq

# -----------------------------------------------------------------------------
# 3. 프로그램 시작점 (Entry Point)
# -----------------------------------------------------------------------------
def main():
    """
    프로그램의 전체 실행 흐름을 제어하는 메인 함수
    """
    db_handler = sq.DatabaseHandler(sq.DB_CONFIG)

    if db_handler.connection and db_handler.connection.is_connected():
        print("\n--- 모든 식당 목록 조회 ---")
        restaurants = db_handler.get_all_restaurants()
        if restaurants:
            for r in restaurants:
                print(f"[{r['restaurant_id']}] {r['name']} ({r['location']})")

    # 연결 종료
    db_handler.close_connection()

if __name__ == "__main__":
    main()