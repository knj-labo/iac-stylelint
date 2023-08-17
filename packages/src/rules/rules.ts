import stylelint from 'stylelint';
import * as CSS from 'csstype';
import type * as PostCSS from 'postcss';

type Policy = {
  forbidden?: string[];
  allowed?: string[];
  valueRegex?: RegExp | string;
};

type PrimaryOption = Record<
  keyof CSS.StandardPropertiesHyphen,
  Partial<Policy>
>;
type SecondaryOption = Record<'severity', 'error' | 'warning'>;

const ruleName = 'props-in-files';

const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (...args) => {
    const [prop, value] = args;
    return `"${prop}" CSS property with "${value}" value was found in a file it should not be in`;
  },
});

const meta = {
  url: 'git+https://github.com/knj-labo/iac-stylelint.git',
};

const ALL_FILES_KEYWORD = 'all';

const ruleFunction = (
  primaryOption: PrimaryOption,
  secondaryOptionObject: SecondaryOption,
) => {
  return (
    postcssRoot: PostCSS.Root,
    postcssResult: stylelint.PostcssResult,
  ) => {
    const validOptions = stylelint.utils.validateOptions(
      postcssResult,
      ruleName,
      {
        actual: null,
      },
    );

    console.log(secondaryOptionObject);

    if (!validOptions) {
      return;
    }

    postcssRoot.walkDecls((decl: PostCSS.Declaration) => {
      const propRule =
        primaryOption[decl.prop as keyof CSS.StandardPropertiesHyphen];

      if (!propRule) {
        return;
      }

      const file = postcssRoot?.source?.input?.file;
      const allowedFiles = propRule.allowed;
      const forbiddenFiles = propRule.forbidden;
      let shouldReport = false;
      const valueRegex =
        typeof propRule.valueRegex === 'string'
          ? new RegExp(propRule.valueRegex)
          : propRule.valueRegex;

      const isFileValid = (
        inspectedFile: string,
        index: number,
        files: string[],
      ) => {
        let result = false;

        console.log(index);

        const isRegexValueComply = valueRegex
          ? valueRegex.test(decl.value)
          : true;

        if (files.includes(ALL_FILES_KEYWORD)) {
          result = isRegexValueComply;
        } else {
          result =
            (file?.includes(inspectedFile) as boolean) && isRegexValueComply;
        }
        return result;
      };
      if (allowedFiles) {
        shouldReport = !allowedFiles.some(isFileValid);
      }

      if (forbiddenFiles) {
        shouldReport = forbiddenFiles.some(isFileValid);
      }

      if (!shouldReport) {
        return;
      }

      stylelint.utils.report({
        ruleName,
        result: postcssResult,
        message: messages.expected(decl.prop, decl.value),
        node: decl,
      });
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default ruleFunction;
