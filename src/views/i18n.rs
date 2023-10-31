use std::collections::HashMap;

use fluent::{bundle::FluentBundle, FluentResource};
use unic_langid::{langid, LanguageIdentifier};

pub const ENGLISH: LanguageIdentifier = langid!("en");
pub const JAPANESE: LanguageIdentifier = langid!("ja");

pub type Locales = HashMap<
    LanguageIdentifier,
    FluentBundle<FluentResource, intl_memoizer::concurrent::IntlLangMemoizer>,
>;

pub struct Localizer {
    locales: Locales,
}

impl Localizer {
    pub fn new() -> Self {
        let locales = init();

        Self { locales }
    }
}

impl tera::Function for Localizer {
    fn call(&self, args: &HashMap<String, serde_json::Value>) -> tera::Result<serde_json::Value> {
        let lang_arg = args
            .get("lang")
            .and_then(|lang| lang.as_str())
            .and_then(|str| str.parse::<LanguageIdentifier>().ok())
            .ok_or(tera::Error::msg("missing lang param"))?;

        let ftl_key = args
            .get("key")
            .and_then(|key| key.as_str())
            .ok_or(tera::Error::msg("missing ftl key"))?;

        let bundle = self
            .locales
            .get(&lang_arg)
            .ok_or(tera::Error::msg("locale not registered"))?;

        let msg = bundle
            .get_message(ftl_key)
            .ok_or(tera::Error::msg("FTL key not in locale"))?;
        let pattern = msg
            .value()
            .ok_or(tera::Error::msg("No value in fluent message"))?;

        let mut errs = Vec::new();
        let res = bundle.format_pattern(pattern, None, &mut errs);

        if errs.len() > 0 {
            dbg!(errs);
        }

        Ok(serde_json::Value::String(res.into()))
    }

    fn is_safe(&self) -> bool {
        true
    }
}

macro_rules! create_bundle {
    ($path: expr, $locales: expr) => {{
        let ftl = std::fs::read_to_string($path).expect("FTL File not found");
        let ftl = FluentResource::try_new(ftl).expect("FTL Parse Error");
        let mut bundle = FluentBundle::new_concurrent($locales);
        bundle.add_resource(ftl).expect("unable to add resource");

        bundle
    }};
}

fn init() -> Locales {
    let mut locales: Locales = HashMap::new();

    let en = create_bundle!("locales/en/main.ftl", vec![ENGLISH]);
    locales.insert(ENGLISH, en);

    let ja = create_bundle!("locales/ja/main.ftl", vec![JAPANESE]);
    locales.insert(JAPANESE, ja);

    locales
}
