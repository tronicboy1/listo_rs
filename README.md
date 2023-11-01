# About this Project

This is an implementation of a shared shopping list in rust.

# Getting Started

Start up a MySQL database in docker.

Use the following commands to startup a local server:

```
RECAPTCHA_SECRET_KEY=secret_code DB_PASSWORD=password PORT=3000 DB_PORT=3307 cargo run
```

# Database

## Init

### Groups

```sql
CREATE TABLE `families` (
  family_id SERIAL PRIMARY KEY,
  `family_name` VARCHAR(255) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### lists

```sql
CREATE TABLE `lists` (
  list_id SERIAL PRIMARY KEY,
  family_id BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  FOREIGN KEY (`family_id`) REFERENCES `families`(family_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Items

```sql
CREATE TABLE list_items (
  item_id SERIAL PRIMARY KEY,
  list_id BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  amount INT NOT NULL DEFAULT 1,
  FOREIGN KEY (list_id) REFERENCES lists(list_id) ON DELETE CASCADE,
  CONSTRAINT same_item_per_list UNIQUE (list_id, `name`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Users

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  UNIQUE(email)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Users-Families

```sql
CREATE TABLE users_families (
  user_family_id SERIAL PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  family_id BIGINT UNSIGNED NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
  CONSTRAINT no_same_user_in_family UNIQUE (user_id, family_id)
);
```
