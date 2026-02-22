const common = {
  requireModule: ["ts-node/register"],
  require: ["src/step-definitions/**/*.ts", "src/utils/world.ts"],
  format: [
    "progress-bar",
    "json:reports/cucumber-report.json",
    "html:reports/cucumber-report.html",
  ],
  formatOptions: {
    snippetInterface: "async-await",
  },
  publishQuiet: true,
};

module.exports = {
  default: {
    ...common,
    paths: ["src/features/**/*.feature"],
  },
  smoke: {
    ...common,
    paths: ["src/features/**/*.feature"],
    tags: "@smoke",
  },
  regression: {
    ...common,
    paths: ["src/features/**/*.feature"],
    tags: "@regression",
  },
};
