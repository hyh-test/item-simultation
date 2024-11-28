item smiluation

# API Documentation

## 1. 회원가입 및 로그인 기능

### 1.1. 회원가입 (Sign Up)
- **Method**: `POST`
- **URL**: `http://localhost:3018/api/sign-up`
- **Description**: 새로운 사용자를 등록합니다.
- **Request Body**:
    ```json
     {
        "email": "user123",
        "password": "password123"
        "username": "username123"
    }
    ```
- **Response**: 사용자 등록 성공 시 상태 코드 `201 Created` 반환.

---

### 1.2. 로그인 (Sign In)
- **Method**: `POST`
- **URL**: `http://localhost:3018/api/sign-in`
- **Description**: 기존 사용자 로그인을 처리합니다.
- **Request Body**:
    ```json
    {
        "email": "user123",
        "password": "password123"
    }
    ```
- **Response**: 로그인 성공 시 JWT 토큰 반환.

---

## 2. 사용자 및 캐릭터 관리 기능

### 2.1. 사용자 정보 조회
- **Method**: `GET`
- **URL**: `http://localhost:3018/api/users`
- **Description**: 로그인한 사용자의 정보를 조회합니다.
- **Authentication**: JWT 인증 필요
- **Response**: 사용자 정보 반환.

---

### 2.2. 캐릭터 생성
- **Method**: `POST`
- **URL**: `http://localhost:3018/api/character`
- **Description**: 로그인한 유저에 대해 새로운 캐릭터를 생성합니다.
- **Authentication**: JWT 인증 필요
- **Request Body**:
    ```json
    {
        "name": "MyCharacter"
    }
    ```
- **Response**: 생성된 캐릭터 정보 반환.

---

### 2.3. 캐릭터 상세 조회
- **Method**: `GET`
- **URL**: `http://localhost:3018/api/character/:characterId`
- **Description**: 특정 캐릭터의 상세 정보를 조회합니다.
- **Authentication**: JWT 인증 필요
- **URL Parameters**:
    - `:characterId`: 조회할 캐릭터 ID
- **Response**: 캐릭터 상세 정보 반환.

---

### 2.4. 캐릭터 삭제
- **Method**: `DELETE`
- **URL**: `http://localhost:3018/api/character/:characterId`
- **Description**: 특정 캐릭터를 삭제합니다.
- **Authentication**: JWT 인증 필요
- **URL Parameters**:
    - `:characterId`: 삭제할 캐릭터 ID
- **Response**: 삭제 성공 메시지 반환.

---

### 2.5. 캐릭터 돈 추가
- **Method**: `PATCH`
- **URL**: `http://localhost:3018/api/character/money/:characterId`
- **Description**: 특정 캐릭터에 고정된 금액을 추가합니다.
- **Authentication**: JWT 인증 필요
- **URL Parameters**:
    - `:characterId`: 돈을 추가할 캐릭터 ID
- **Response**: 캐릭터에 돈이 추가된 정보 반환.


---

## 3. 아이템 관리 기능

### 3.1. 아이템 생성
- **Method**: `POST`
- **URL**: `http://localhost:3018/api/item/create`
- **Description**: 새로운 아이템을 생성합니다.
- **Request Body**:
    ```json
    {
  "name": "파멸의 방패",
  "price": 35000,
  "rarity": "전설",
  "attack": 30,
  "defense": 120,
  "health": 0,
  "description": "이 방패는 적의 공격을 완벽히 차단하고, 착용자의 방어력을 극대화한다."
    }
    ```
- **Response**: 생성된 아이템 정보 반환.

---

### 3.2. 아이템 수정
- **Method**: `PATCH`
- **URL**: `http://localhost:3018/api/item/:itemId`
- **Description**: 특정 아이템의 정보를 수정합니다 (가격은제외).
- **URL Parameters**:
    - `:itemId`: 수정할 아이템 ID
- **Request Body**:
    ```json
    {
 "name": "파멸의 방패",
  "rarity": "전설",
  "attack": 30,
  "defense": 120,
  "health": 0,
  "description": "이 방패는 적의 공격을 완벽히 차단하고, 착용자의 방어력을 극대화한다."
    }
    ```
- **Response**: 수정된 아이템 정보 반환.

---

### 3.3. 아이템 전체 조회
- **Method**: `GET`
- **URL**: `http://localhost:3018/api/item/items`
- **Description**: 모든 아이템을 조회합니다.
- **Response**: 아이템 목록 반환.

---

### 3.4. 아이템 상세 조회
- **Method**: `GET`
- **URL**: `http://localhost:3018/api/item/:itemId`
- **Description**: 특정 아이템의 상세 정보를 조회합니다.
- **URL Parameters**:
    - `:itemId`: 조회할 아이템 ID
- **Response**: 아이템 상세 정보 반환.

---

## 4. 아이템 거래 및 장비 기능

### 4.1. 아이템 구매
- **Method**: `POST`
- **URL**: `http://localhost:3018/api/itemshop/buy/:characterId`
- **Description**: 캐릭터가 아이템을 구매합니다.
- **Authentication**: JWT 인증 필요
- **URL Parameters**:
    - `:characterId`: 아이템을 구매할 캐릭터 ID
- **Request Body**:
    ```json
    {
        "itemId": 1,
        "quantity": 1

    }
    ```
- **Response**: 구매한 아이템 정보 반환.

---

### 4.2. 아이템 판매
- **Method**: `PATCH`
- **URL**: `http://localhost:3018/api/itemshop/sell/:characterId`
- **Description**: 캐릭터가 아이템을 판매합니다.
- **Authentication**: JWT 인증 필요
- **URL Parameters**:
    - `:characterId`: 아이템을 판매할 캐릭터 ID
- **Request Body**:
    ```json
    {
        "itemId": 1,
        "quantity": 1

    }
    ```
- **Response**: 판매된 아이템 정보 반환.

---

### 4.3. 캐릭터의 아이템 조회
- **Method**: `GET`
- **URL**: `http://localhost:3018/api/inventory/:characterId`
- **Description**: 특정 캐릭터의 아이템 목록을 조회합니다.
- **Authentication**: JWT 인증 필요
- **URL Parameters**:
    - `:characterId`: 아이템을 조회할 캐릭터 ID
- **Response**: 캐릭터의 아이템 목록 반환.

---

### 4.4. 캐릭터의 장착된 장비 조회
- **Method**: `GET`
- **URL**: `http://localhost:3018/api/equippedItem/:characterId`
- **Description**: 캐릭터가 장착한 장비들을 조회합니다.
- **Authentication**: JWT 인증 필요
- **URL Parameters**:
    - `:characterId`: 장착된 장비를 조회할 캐릭터 ID
- **Response**: 캐릭터의 장착된 장비 목록 반환.

---

### 4.5. 장비 장착
- **Method**: `POST`
- **URL**: `http://localhost:3018/equippedItem/equip/:characterId`
- **Description**: 캐릭터가 장비를 장착합니다.
- **Authentication**: JWT 인증 필요
- **URL Parameters**:
    - `:characterId`: 장비를 장착할 캐릭터 ID
- **Request Body**:
    ```json
    {
        "itemId": 1
    }
    ```
- **Response**: 장착된 장비 정보 반환.

---

### 4.6. 장비 해제
- **Method**: `POST`
- **URL**: `http://localhost:3018/equippedItem/unequip/:characterId`
- **Description**: 캐릭터가 장착된 장비를 해제합니다.
- **Authentication**: JWT 인증 필요
- **URL Parameters**:
    - `:characterId`: 장비를 해제할 캐릭터 ID
- **Request Body**:
    ```json
    {
        "itemId": 1
    }
    ```
- **Response**: 해제된 장비 정보 반환.

---






