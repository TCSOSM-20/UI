var c = {};

c.PLATFORM = {
  OPER: "rw-rbac-platform:platform-oper",
  ADMIN: "rw-rbac-platform:platform-admin",
  SUPER: "rw-rbac-platform:super-admin"
}

c.PROJECT = {
    CATALOG_OPER: "rw-project-mano:catalog-oper",
    CATALOG_ADMIN: "rw-project-mano:catalog-admin",
    LCM_OPER: "rw-project-mano:lcm-oper",
    LCM_ADMIN: "rw-project-mano:lcm-admin",
    ACCOUNT_OPER: "rw-project-mano:account-oper",
    ACCOUNT_ADMIN: "rw-project-mano:account-admin",
    PROJECT_ADMIN: "rw-project:project-admin",
    PROJECT_OPER: "rw-project:project-oper",
}

module.exports = c;
