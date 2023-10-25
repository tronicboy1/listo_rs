use mysql_async::prelude::*;

use crate::find_col_or_err;

/// A group (family) of users that have access to lists
/// A family object owns lists, and multiple users belong to a family.
struct Family {
    family_id: u64,
    name: String,
}

impl FromRow for Family {
    fn from_row_opt(mut row: mysql_async::Row) -> Result<Self, mysql_async::FromRowError>
    where
        Self: Sized,
    {
        let family = Family {
            family_id: find_col_or_err!(row, "family_id")?,
            name: find_col_or_err!(row, "name")?,
        };

        Ok(family)
    }
}
