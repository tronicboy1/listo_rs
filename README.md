# About this Project

This is an implementation of a shared shopping list in rust.

# Database

## Init

### Groups

```sql
CREATE TABLE `families` (
  family_id SERIAL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL
);
```

### lists

```sql
CREATE TABLE `lists` (
  list_id SERIAL PRIMARY KEY,
  family_id BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  FOREIGN KEY (`family_id`) REFERENCES `families`(family_id)
);
```

### Items

```sql
CREATE TABLE list_items (
  item_id SERIAL PRIMARY KEY,
  list_id BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  amount INT NOT NULL DEFAULT 1,
  FOREIGN KEY (list_id) REFERENCES lists(list_id),
  CONSTRAINT same_item_per_list UNIQUE (list_id, `name`)
);
```
