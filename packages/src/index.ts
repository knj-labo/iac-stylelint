import { createPlugin } from 'stylelint';
import rules from './rules';

const NAMESPACE = 'iac';

const rulesPlugins = Object.keys(rules).map((ruleName: string) => {
  return createPlugin(`${NAMESPACE}/${ruleName}`, rules[ruleName]);
});

export default rulesPlugins;
