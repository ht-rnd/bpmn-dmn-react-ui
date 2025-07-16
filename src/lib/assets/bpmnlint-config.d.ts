declare const bpmnlintConfig: {
  resolver: {
    resolveRule: (pkg: string, ruleName: string) => object | undefined;
    resolveConfig: (pkg: string, configName: string) => object | undefined;
  };
  config: {
    rules: {
      [key: string]: "error" | "warn";
    };
  };
};

export default bpmnlintConfig;
