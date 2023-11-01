import {FluentBundle, FluentResource, Message} from "@fluent/bundle";
import EN_FTL from "../locales/en/main.ftl?raw";
import JA_FTL from "../locales/ja/main.ftl?raw";

export class Localization {
  private static _bundles: Map<string, FluentBundle>;

  static get bundles() {
    return (this._bundles ??= this.initBundles());
  }

  private static initBundles(): Map<string, FluentBundle> {
    const bundles = new Map();

    const enBundle = new FluentBundle("en");
    enBundle.addResource(new FluentResource(EN_FTL));
    bundles.set("en", enBundle);

    const jaBundle = new FluentBundle("ja");
    jaBundle.addResource(new FluentResource(JA_FTL));
    bundles.set("ja", jaBundle);

    return bundles;
  }

  static getLocale(ident: string): FluentBundle {
    const bundle = this.bundles.get(ident);

    if (!bundle) {
      throw ReferenceError("unsupported locale");
    }

    return bundle;
  }

  static formatMessage(ident: string, key: string, args?: {}): string | undefined {
    const bundle = this.bundles.get(ident);

    const message = bundle?.getMessage(key);

    return message?.value ? bundle!.formatPattern(message.value, args) : undefined;
  }
}
