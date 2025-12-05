import mysql.connector
from mysql.connector import Error

# --- 데이터베이스 연결 정보 ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'rootpassword0811',
    'database': 'dku_bab_schema'
}

class DatabaseHandler:
    """
    MySQL 데이터베이스 연결 및 쿼리 실행을 관리하는 클래스.
    이 클래스의 인스턴스 생성하여 모든 DB 작업을 처리.
    """
    def __init__(self, config):
        self.config = config
        self.connection = None
        try:
            self.connection = mysql.connector.connect(**self.config)
            if self.connection.is_connected():
                print("MySQL 데이터베이스에 성공적으로 연결되었습니다.")
        except Error as e:
            print(f"'{e}' 오류로 인해 연결에 실패했습니다.")

    def _execute_query(self, query, params=None, fetch=None):
        """
        쿼리 실행을 위한 내부 함수.
        :param query: 실행할 SQL 쿼리문
        :param params: 쿼리에 전달할 파라미터 (SQL Injection 방지)
        :param fetch: 'one', 'all' 중 선택하여 결과를 가져옴
        :return: 쿼리 실행 결과
        """
        cursor = self.connection.cursor(dictionary=True) # 결과를 딕셔너리 형태로
        try:
            cursor.execute(query, params or ())
            if fetch == 'one':
                return cursor.fetchone()
            elif fetch == 'all':
                return cursor.fetchall()
            else:
                self.connection.commit() # INSERT, UPDATE, DELETE 쿼리
                return cursor.lastrowid # 마지막 행 ID 반환
        except Error as e:
            print(f"쿼리 실행 중 오류 발생: {e}")
            return None
        finally:
            cursor.close()

    def close_connection(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL 연결이 종료되었습니다.")

    # --- (User) ---
    def add_user(self, user_id, password_hash, nickname):
        """사용자 추가."""
        query = "INSERT INTO users (user_id, password, nickname) VALUES (%s, %s, %s)"
        self._execute_query(query, (user_id, password_hash, nickname))
        print(f"사용자 '{nickname}'이(가) 추가되었습니다.")

    def get_user_by_id(self, user_id):
        """ID로 사용자를 조회."""
        query = "SELECT * FROM users WHERE user_id = %s"
        return self._execute_query(query, (user_id,), fetch='one')

    # --- (Restaurant/Menu) ---
    def get_all_restaurants(self):
        """식당 목록 조회."""
        query = "SELECT * FROM restaurants"
        return self._execute_query(query, fetch='all')

    def get_menus_by_restaurant(self, restaurant_id):
        """특정 식당 모든 메뉴 조회."""
        query = "SELECT * FROM menus WHERE restaurant_id = %s"
        return self._execute_query(query, (restaurant_id,), fetch='all')

    # --- 리뷰(Review) 관련 쿼리 ---
    def add_review(self, user_id, menu_id, rating, content, image_url=None):
        """리뷰 추가."""
        query = "INSERT INTO reviews (user_id, menu_id, rating, content, image_url) VALUES (%s, %s, %s, %s, %s)"
        self._execute_query(query, (user_id, menu_id, rating, content, image_url))
        print(f"메뉴 ID '{menu_id}'에 대한 새 리뷰가 추가되었습니다.")

    def get_reviews_by_menu(self, menu_id):
        """특정 메뉴 모든 리뷰 조회."""
        query = "SELECT r.*, u.nickname FROM reviews r JOIN users u ON r.user_id = u.user_id WHERE r.menu_id = %s ORDER BY r.created_at DESC"
        return self._execute_query(query, (menu_id,), fetch='all')

    def update_review(self, review_id, new_content):
        """리뷰 내용 수정."""
        query = "UPDATE reviews SET content = %s WHERE review_id = %s"
        self._execute_query(query, (new_content, review_id))
        print(f"리뷰 ID '{review_id}'의 내용이 수정되었습니다.")

    def delete_review(self, review_id):
        """리뷰 삭제"""
        query = "DELETE FROM reviews WHERE review_id = %s"
        self._execute_query(query, (review_id,))
        print(f"리뷰 ID '{review_id}'가 삭제되었습니다.")