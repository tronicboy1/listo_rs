use std::collections::HashMap;

use fluent::FluentArgs;
use fluent::{bundle::FluentBundle, FluentResource};
use unic_langid::subtags::Language;
use unic_langid::{langid, LanguageIdentifier};

mod language_identifier;

pub use language_identifier::LanguageIdentifierExtractorLayer;
pub use language_identifier::TeraLanguageIdentifier;

pub const ENGLISH: LanguageIdentifier = langid!("en");
pub const JAPANESE: LanguageIdentifier = langid!("ja");

pub type Locales =
    HashMap<Language, FluentBundle<FluentResource, intl_memoizer::concurrent::IntlLangMemoizer>>;

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
            .get(&lang_arg.language)
            .ok_or(tera::Error::msg("locale not registered"))?;

        let msg = bundle
            .get_message(ftl_key)
            .ok_or(tera::Error::msg("FTL key not in locale"))?;
        let pattern = msg
            .value()
            .ok_or(tera::Error::msg("No value in fluent message"))?;

        let fluent_args: FluentArgs = args
            .iter()
            .filter(|(key, _)| key.as_str() != "lang" && key.as_str() != "key")
            .filter_map(|(key, val)| val.as_str().map(|val| (key, val)))
            .collect();

        let mut errs = Vec::new();
        let res = bundle.format_pattern(pattern, Some(&fluent_args), &mut errs);

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
    ($locales: expr, $($path: expr),+) => {{
        let mut bundle = FluentBundle::new_concurrent($locales);

        $({
            let ftl = std::fs::read_to_string($path).expect("FTL File not found");
            let ftl = FluentResource::try_new(ftl).expect("FTL Parse Error");
            bundle.add_resource(ftl).expect("unable to add resource");
        })+

        bundle
    }};
    ($locales: expr, $($path: expr,)+) => {
        create_bundle!($locales, $($path),+)
    };
}

fn init() -> Locales {
    let mut locales = HashMap::new();

    let en = create_bundle!(vec![ENGLISH], "locales/en/main.ftl", "locales/en/login.ftl");
    locales.insert(ENGLISH.language, en);

    let ja = create_bundle!(
        vec![JAPANESE],
        "locales/ja/main.ftl",
        "locales/ja/login.ftl",
    );
    locales.insert(JAPANESE.language, ja);

    locales
}

pub fn supported(lang: &LanguageIdentifier) -> bool {
    lang.language == ENGLISH.language || lang.language == JAPANESE.language
}
